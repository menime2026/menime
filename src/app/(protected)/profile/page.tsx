"use client";

import { useEffect, useMemo, useState, useRef, type ChangeEvent } from "react";
import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Trash2, Check, ArrowUpRight } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ImageKitUploadValue } from "@/components/ui/imagekit-upload";
import { useImageKitUpload } from "@/hooks/use-imagekit-upload";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  accountUpdateSchema,
  createAddressSchema,
  type AccountUpdateInput,
  type CreateAddressInput,
} from "@/lib/validators/profile";
import type {
  FormattedProfileAddress,
  ProfileResponse,
} from "@/server/profile-service";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const accountFormSchema = accountUpdateSchema.omit({ avatar: true });
type AccountFormValues = z.infer<typeof accountFormSchema>;
type AddressFormValues = z.infer<typeof createAddressSchema>;

type Feedback = {
  status: "success" | "error";
  message: string;
};

type AddressEditorState =
  | { mode: "create" }
  | { mode: "edit"; address: FormattedProfileAddress };

const ProfileAvatarUploader = ({
	value,
	onChange,
	onError,
}: {
	value: ImageKitUploadValue[];
	onChange: (value: ImageKitUploadValue[]) => void;
	onError: (message: string) => void;
}) => {
	const { uploadFiles, isUploading } = useImageKitUpload({ folder: "/avatars" });
	const fileInputRef = useRef<HTMLInputElement>(null);

	const currentImage = value[0];

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		try {
			const { results } = await uploadFiles(Array.from(files));
			if (results.length > 0) {
				onChange([results[0]]);
			}
		} catch (err) {
			onError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div
			className="group relative h-full w-full cursor-pointer"
			onClick={() => !isUploading && fileInputRef.current?.click()}
		>
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>

			{currentImage ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={currentImage.url}
					alt="Profile"
					className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
					<span className="text-xs font-bold uppercase">Upload</span>
				</div>
			)}

			{/* Overlay for loading or hover hint */}
			<div className={cn(
				"absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity",
				isUploading ? "opacity-100" : "group-hover:opacity-100"
			)}>
				{isUploading ? (
					<Loader2 className="h-6 w-6 animate-spin text-white" />
				) : (
					<span className="text-[10px] font-bold uppercase tracking-widest text-white">
						Change
					</span>
				)}
			</div>
		</div>
	);
};

const parseJson = async <T,>(response: Response): Promise<T> => {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? (data as { message?: string }).message
        : undefined;
    throw new Error(message ?? "Request failed");
  }

  return data as T;
};

const toNullable = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return value ?? null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const mapAvatarToUploads = (profile: ProfileResponse | undefined) => {
  if (!profile || !profile.image) {
    return [] as ImageKitUploadValue[];
  }

  return [
    {
      fileId: profile.avatarFileId ?? "external",
      url: profile.image,
      name: "Profile avatar",
    },
  ];
};

const fetchProfile = async () => {
  const response = await fetch("/api/profile", {
    method: "GET",
    cache: "no-store",
  });

  return parseJson<ProfileResponse>(response);
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [accountFeedback, setAccountFeedback] = useState<Feedback | null>(null);
  const [addressFeedback, setAddressFeedback] = useState<Feedback | null>(null);
  const [avatarUploads, setAvatarUploads] = useState<ImageKitUploadValue[]>([]);
  const [addressEditor, setAddressEditor] = useState<AddressEditorState | null>(
    null
  );
  const [addressAction, setAddressAction] = useState<{
    type: "delete" | "default";
    id: string;
  } | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });



  const profile = profileQuery.data;

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: null,
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    accountForm.reset({
      name: profile.name,
      phoneNumber: profile.phoneNumber ?? null,
    });
    setAvatarUploads(mapAvatarToUploads(profile));
  }, [profile, accountForm]);

  const updateProfileMutation = useMutation({
    mutationFn: async (
      payload: Pick<AccountUpdateInput, "name" | "phoneNumber" | "avatar">
    ) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return parseJson<ProfileResponse>(response);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      setAvatarUploads(mapAvatarToUploads(data));
      setAccountFeedback({
        status: "success",
        message: "Profile updated successfully.",
      });
    },
    onError: (error: unknown) => {
      setAccountFeedback({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update profile.",
      });
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: async (payload: CreateAddressInput) => {
      const response = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return parseJson<FormattedProfileAddress>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      setAddressFeedback({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to save address.",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (variables: {
      addressId: string;
      body: Record<string, unknown>;
    }) => {
      const response = await fetch(
        `/api/profile/addresses/${variables.addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(variables.body),
        }
      );

      return parseJson<FormattedProfileAddress>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      setAddressFeedback({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update address.",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(`/api/profile/addresses/${addressId}`, {
        method: "DELETE",
      });

      return parseJson<{ deleted: boolean; defaultAddressId: string | null }>(
        response
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      setAddressFeedback({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to remove address.",
      });
    },
  });

  const avatarChanged = useMemo(() => {
    if (!profile) {
      return avatarUploads.length > 0;
    }

    const currentAvatarId = profile.avatarFileId ?? null;
    const nextAvatar = avatarUploads[0] ?? null;

    if (!currentAvatarId && !nextAvatar) {
      return false;
    }

    if (!currentAvatarId && nextAvatar) {
      return true;
    }

    if (currentAvatarId && !nextAvatar) {
      return true;
    }

    return currentAvatarId !== nextAvatar?.fileId;
  }, [avatarUploads, profile]);

  const onAccountSubmit = accountForm.handleSubmit(async (values) => {
    if (!profile) {
      return;
    }

    setAccountFeedback(null);

    const trimmedName = values.name.trim();
    const phoneValue = toNullable(values.phoneNumber ?? null);
    const nextAvatar = avatarUploads[0] ?? null;

    const payload: Pick<AccountUpdateInput, "name" | "phoneNumber" | "avatar"> =
      {
        name: trimmedName,
        phoneNumber: phoneValue,
      };

    if (avatarChanged) {
      payload.avatar = nextAvatar
        ? {
            url: nextAvatar.url,
            fileId: nextAvatar.fileId,
            name: nextAvatar.name,
          }
        : null;
    }

    await updateProfileMutation.mutateAsync(payload);
  });

  const handleAddressSubmit = async (payload: CreateAddressInput) => {
    setAddressFeedback(null);

    if (addressEditor?.mode === "create") {
      await createAddressMutation.mutateAsync(payload);
      setAddressFeedback({
        status: "success",
        message: "Address added successfully.",
      });
      setAddressEditor(null);
      return;
    }

    if (addressEditor?.mode === "edit") {
      await updateAddressMutation.mutateAsync({
        addressId: addressEditor.address.id,
        body: payload,
      });
      setAddressFeedback({
        status: "success",
        message: "Address updated successfully.",
      });
      setAddressEditor(null);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressFeedback(null);
    setAddressAction({ type: "delete", id: addressId });
    try {
      await deleteAddressMutation.mutateAsync(addressId);
      setAddressFeedback({
        status: "success",
        message: "Address removed successfully.",
      });
      if (
        addressEditor?.mode === "edit" &&
        addressEditor.address.id === addressId
      ) {
        setAddressEditor(null);
      }
    } finally {
      setAddressAction(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setAddressFeedback(null);
    setAddressAction({ type: "default", id: addressId });
    try {
      await updateAddressMutation.mutateAsync({
        addressId,
        body: { setDefault: true },
      });
      setAddressFeedback({
        status: "success",
        message: "Default address updated.",
      });
    } finally {
      setAddressAction(null);
    }
  };

  const hasAddresses = (profile?.addresses?.length ?? 0) > 0;
  const addressCount = profile?.addresses?.length ?? 0;
  const hasPhoneNumber = Boolean(
    profile?.phoneNumber && profile.phoneNumber.trim().length > 0
  );

  const completionScore = useMemo(() => {
    const segments = [
      Boolean(profile?.name && profile?.name.trim().length > 0),
      Boolean(profile?.phoneNumber && profile?.phoneNumber.trim().length > 0),
      avatarUploads.length > 0 || Boolean(profile?.avatarFileId),
      hasAddresses,
    ];
    const filled = segments.filter(Boolean).length;
    return Math.round((filled / segments.length) * 100);
  }, [
    avatarUploads,
    hasAddresses,
    profile?.avatarFileId,
    profile?.name,
    profile?.phoneNumber,
  ]);

  const completionRing = useMemo(
    () =>
      `conic-gradient(#0f172a ${completionScore}%, rgba(15,23,42,0.12) ${completionScore}% 100%)`,
    [completionScore]
  );

	if (profileQuery.isLoading) {
		return (
			<div className="min-h-screen bg-white">
				<div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
					<div className="mb-16 border-b border-slate-100 pb-6">
						<Skeleton className="h-4 w-32" />
					</div>

					<div className="grid gap-12 lg:grid-cols-[300px_1fr] xl:gap-24">
						<aside className="space-y-10">
							<div className="flex flex-col items-start gap-6">
								<Skeleton className="h-24 w-24 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-8 w-48" />
									<Skeleton className="h-4 w-32" />
								</div>
							</div>
							<div className="space-y-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</aside>

						<main className="space-y-20">
							<div className="space-y-8">
								<div className="space-y-2">
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-64" />
								</div>
								<div className="grid gap-6 sm:grid-cols-2">
									<Skeleton className="h-12 w-full" />
									<Skeleton className="h-12 w-full" />
								</div>
								<Skeleton className="h-12 w-32" />
							</div>

							<div className="space-y-8">
								<div className="flex justify-between">
									<div className="space-y-2">
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-64" />
									</div>
									<Skeleton className="h-10 w-32 rounded-full" />
								</div>
								<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
									<Skeleton className="h-64 w-full" />
									<Skeleton className="h-64 w-full" />
									<Skeleton className="h-64 w-full" />
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

  if (profileQuery.isError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <Card className="max-w-md border border-rose-200 bg-rose-50/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-rose-700">
              Unable to load profile
            </CardTitle>
            <CardDescription className="text-rose-600">
              Please refresh the page or try again in a moment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
        <div className="mb-16 border-b border-slate-100 pb-6">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900">
            My Account
          </h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr] xl:gap-24">
          {/* Sidebar / User Info */}
          <aside className="h-fit space-y-10 lg:sticky lg:top-24">
            <div className="flex flex-col items-start gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100">
                <ProfileAvatarUploader
                  value={avatarUploads}
                  onChange={setAvatarUploads}
                  onError={(err) =>
                    setAccountFeedback({ status: "error", message: err })
                  }
                />
              </div>
              <div>
                <h2 className="text-2xl font-light text-slate-900">
                  {profile?.name || "Guest User"}
                </h2>
                <p className="text-sm text-slate-500">{profile?.email}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1">
              <a
                href="#profile"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
              >
                Profile Settings
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href="#addresses"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
              >
                Address Book
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <Link
                href="/orders"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Order History
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-20">
            {/* Profile Settings Section */}
            <section id="profile" className="scroll-mt-32 max-w-2xl space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-slate-900">
                  Personal Details
                </h3>
                <p className="text-sm text-slate-500">
                  Manage your name and contact preferences.
                </p>
              </div>

              <Form {...accountForm}>
                <form onSubmit={onAccountSubmit} className="space-y-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12 rounded-sm border-slate-200 bg-slate-50 px-4 focus:border-slate-900 focus:bg-white focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              value={field.value ?? ""}
                              onChange={(
                                event: ChangeEvent<HTMLInputElement>
                              ) => {
                                const nextValue = event.target.value;
                                field.onChange(
                                  nextValue === "" ? null : nextValue
                                );
                              }}
                              className="h-12 rounded-sm border-slate-200 bg-slate-50 px-4 focus:border-slate-900 focus:bg-white focus:ring-0"
                              placeholder="+91..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    {accountFeedback ? (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-sm",
                          accountFeedback.status === "success"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        )}
                      >
                        {accountFeedback.status === "success" ? (
                          <Check className="h-4 w-4" />
                        ) : null}
                        {accountFeedback.message}
                      </div>
                    ) : (
                      <div />
                    )}

                    <Button
                      type="submit"
                      disabled={
                        updateProfileMutation.isPending ||
                        (!accountForm.formState.isDirty && !avatarChanged)
                      }
                      className="h-12 rounded-sm bg-slate-900 px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </section>

            {/* Addresses Section */}
            <section id="addresses" className="scroll-mt-32 space-y-8">
              <div className="flex items-end justify-between border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-slate-900">
                    Address Book
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage your delivery locations.
                  </p>
                </div>
                {!addressEditor && (
                  <Button
                    onClick={() => setAddressEditor({ mode: "create" })}
                    variant="outline"
                    className="h-10 rounded-full border-slate-200 px-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900"
                  >
                    Add New
                  </Button>
                )}
              </div>

              {addressFeedback && (
                <div
                  className={cn(
                    "mb-6 flex items-center gap-2 rounded-sm p-4 text-sm",
                    addressFeedback.status === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  )}
                >
                  {addressFeedback.status === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                  {addressFeedback.message}
                  <button
                    type="button"
                    onClick={() => setAddressFeedback(null)}
                    className="ml-auto hover:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {addressEditor ? (
                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                  <AddressEditor
                    mode={addressEditor.mode}
                    initialValues={
                      addressEditor.mode === "edit"
                        ? addressEditor.address
                        : undefined
                    }
                    onSubmit={handleAddressSubmit}
                    onCancel={() => {
                      setAddressEditor(null);
                      setAddressFeedback(null);
                    }}
                    isProcessing={
                      createAddressMutation.isPending ||
                      updateAddressMutation.isPending
                    }
                    hasExistingAddresses={(profile?.addresses.length ?? 0) > 0}
                  />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {profile?.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="group relative flex flex-col justify-between rounded-sm border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
                              {address.label || "Address"}
                            </span>
                            {address.isDefault && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() =>
                                setAddressEditor({ mode: "edit", address })
                              }
                              className="text-xs font-medium text-slate-500 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">/</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-xs font-medium text-rose-500 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">
                            {address.fullName}
                          </p>
                          <p>{address.streetLine1}</p>
                          {address.streetLine2 && <p>{address.streetLine2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                          {address.phoneNumber && (
                            <p className="pt-2 text-xs text-slate-400">
                              {address.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs font-medium text-slate-500 hover:bg-transparent hover:text-slate-900"
                            onClick={() => handleSetDefault(address.id)}
                          >
                            {updateAddressMutation.isPending ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              "Set default"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!profile?.addresses || profile.addresses.length === 0) && (
                    <button
                      type="button"
                      onClick={() => setAddressEditor({ mode: "create" })}
                      className="group flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-sm border border-slate-100 bg-slate-50/30 p-6 text-center transition-all hover:border-slate-900 hover:bg-white"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110">
                        <Plus className="h-4 w-4 text-slate-900" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          Add your first address
                        </p>
                        <p className="text-xs text-slate-500">
                          Save time at checkout
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

type AddressEditorProps = {
  mode: "create" | "edit";
  initialValues?: FormattedProfileAddress;
  onSubmit: (payload: CreateAddressInput) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
  hasExistingAddresses: boolean;
};

const AddressEditor = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isProcessing,
  hasExistingAddresses,
}: AddressEditorProps) => {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      label: initialValues?.label ?? "",
      fullName: initialValues?.fullName ?? "",
      phoneNumber: initialValues?.phoneNumber ?? null,
      streetLine1: initialValues?.streetLine1 ?? "",
      streetLine2: initialValues?.streetLine2 ?? "",
      city: initialValues?.city ?? "",
      state: initialValues?.state ?? "",
      postalCode: initialValues?.postalCode ?? "",
      country: initialValues?.country ?? "",
      setDefault:
        initialValues?.isDefault ??
        (!hasExistingAddresses && mode === "create"),
    },
  });

  useEffect(() => {
    form.reset({
      label: initialValues?.label ?? "",
      fullName: initialValues?.fullName ?? "",
      phoneNumber: initialValues?.phoneNumber ?? null,
      streetLine1: initialValues?.streetLine1 ?? "",
      streetLine2: initialValues?.streetLine2 ?? "",
      city: initialValues?.city ?? "",
      state: initialValues?.state ?? "",
      postalCode: toNullable(initialValues?.postalCode),
      country: initialValues?.country ?? "",
      setDefault:
        initialValues?.isDefault ??
        (!hasExistingAddresses && mode === "create"),
    });
  }, [form, initialValues, hasExistingAddresses, mode]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateAddressInput = {
      label: toNullable(values.label),
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber,
      streetLine1: values.streetLine1.trim(),
      streetLine2: toNullable(values.streetLine2),
      city: values.city.trim(),
      state: toNullable(values.state),
      postalCode: toNullable(values.postalCode),
      country: values.country.trim(),
      setDefault: values.setDefault,
    };

    await onSubmit(payload);
  });

  return (
    <div className="rounded-sm border border-slate-200 bg-slate-50/50 p-8">
      <div className="mb-8">
        <h3 className="text-lg font-medium text-slate-900">
          {mode === "create" ? "Add New Address" : "Edit Address"}
        </h3>
        <p className="text-sm text-slate-500">
          We’ll keep everything aligned with your delivery preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Label (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.target.value)
                      }
                      placeholder="Home, Work, etc."
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Recipient Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Contact Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const nextValue = event.target.value;
                        field.onChange(nextValue === "" ? null : nextValue);
                      }}
                      placeholder="Optional"
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streetLine1"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Address Line 1
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="streetLine2"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Address Line 2 (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.target.value)
                      }
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    City
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    State / Region
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.target.value)
                      }
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Postal Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.target.value)
                      }
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Country
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 rounded-sm border-slate-200 bg-white px-4 focus:border-slate-900 focus:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="setDefault"
              render={({ field }) => (
                <FormItem className="col-span-full flex items-center justify-between rounded-sm border border-slate-200 bg-white px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Use as default address
                    </p>
                    <p className="text-xs text-slate-500">
                      We’ll send deliveries here unless you pick another spot at
                      checkout.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
            <Button
              variant="ghost"
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="h-12 rounded-sm bg-slate-900 px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Save Address"
              ) : (
                "Update Address"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfilePage;
