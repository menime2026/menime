"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useEffect } from "react";
import { ImageUpload } from "./image-upload";
import { VideoUpload } from "./video-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { TrendingItemsFields } from "./fields/trending-items-fields";
import { EditItemsFields } from "./fields/edit-items-fields";
import { EditorialItemsFields } from "./fields/editorial-items-fields";

const formSchema = z.object({
  sectionType: z.string().min(1, "Section type is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.any(),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type ElementFormProps = {
  initialData?: any | null;
  onSuccess: () => void;
};

type FormValues = z.infer<typeof formSchema>;

export const ElementForm = ({ initialData, onSuccess }: ElementFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      sectionType: "",
      title: "",
      subtitle: "",
      content: {},
      order: 0,
      isActive: true,
    },
  });

  const { watch, setValue, control } = form;
  const sectionType = watch("sectionType");

  useEffect(() => {
    if (initialData) {
      form.reset({
        sectionType: initialData.sectionType,
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        content: initialData.content,
        order: initialData.order,
        isActive: initialData.isActive,
      });
    }
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const url = initialData
        ? `/api/admin/homepage/${initialData.id}`
        : "/api/admin/homepage";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save element");
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        initialData ? "Element updated successfully" : "Element created successfully"
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate(values);
  };

  const handleTypeChange = (value: string) => {
    setValue("sectionType", value);
    if (!initialData) {
      // Set default structure based on type
      let defaultContent = {};
      switch (value) {
        case "HERO":
          defaultContent = { slides: [] };
          break;
        case "CATEGORY":
          defaultContent = { categories: [] };
          break;
        case "NEW_ARRIVALS":
          defaultContent = { items: [] };
          break;
        case "CURATED":
          defaultContent = { curatedItems: [] };
          break;
        case "PROMO":
          defaultContent = {
            title: "",
            subtitle: "",
            description: "",
            image: "",
            link: "",
            linkText: "",
            secondaryLink: "",
            secondaryLinkText: "",
          };
          break;
        case "TRENDING":
          defaultContent = {
            trendingItems: [],
            editItems: [],
            editorialItems: [],
          };
          break;
        case "TRENDING_NOW":
          defaultContent = { trendingItems: [] };
          break;
        case "THE_EDIT":
          defaultContent = { editItems: [] };
          break;
        case "EDITORIAL":
          defaultContent = { editorialItems: [] };
          break;
        case "VIDEO_BANNER":
          defaultContent = { videos: [] };
          break;
      }
      setValue("content", defaultContent);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="sectionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Type</FormLabel>
              <Select
                onValueChange={handleTypeChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HERO">Hero Carousel</SelectItem>
                  <SelectItem value="CATEGORY">Shop By Category</SelectItem>
                  <SelectItem value="NEW_ARRIVALS">New Arrivals</SelectItem>
                  <SelectItem value="CURATED">Curated For You</SelectItem>
                  <SelectItem value="PROMO">Promo Banner</SelectItem>
                  <SelectItem value="TRENDING">Trending (Legacy)</SelectItem>
                  <SelectItem value="TRENDING_NOW">Trending Now</SelectItem>
                  <SelectItem value="THE_EDIT">The Edit</SelectItem>
                  <SelectItem value="EDITORIAL">Editorial</SelectItem>
                  <SelectItem value="VIDEO_BANNER">Video Banner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Section Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Section Subtitle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dynamic Content Fields */}
        <div className="space-y-4 border rounded-md p-4 bg-slate-50">
          <h3 className="font-medium text-sm text-slate-900 mb-4">Content Configuration</h3>

          {sectionType === "HERO" && <HeroFields control={control} />}
          {sectionType === "CATEGORY" && <CategoryFields control={control} />}
          {sectionType === "NEW_ARRIVALS" && <NewArrivalsFields control={control} />}
          {sectionType === "CURATED" && <CuratedItemsFields control={control} />}
          {sectionType === "PROMO" && <PromoFields control={control} />}
          {sectionType === "TRENDING" && <TrendingFields control={control} />}
          {sectionType === "TRENDING_NOW" && <TrendingItemsFields control={control} />}
          {sectionType === "THE_EDIT" && <EditItemsFields control={control} />}
          {sectionType === "EDITORIAL" && <EditorialItemsFields control={control} />}
          {sectionType === "VIDEO_BANNER" && <VideoBannerFields control={control} />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8 bg-white">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Element"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// --- Sub-components for each section type ---

const HeroFields = ({ control }: { control: Control<FormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.slides",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slide {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.slides.${index}.src`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`content.slides.${index}.alt`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), src: "", alt: "" })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Slide
      </Button>
    </div>
  );
};

const CategoryFields = ({ control }: { control: Control<FormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.categories",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.categories.${index}.image`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`content.categories.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`content.categories.${index}.href`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), title: "", image: "", href: "" })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>
    </div>
  );
};

const NewArrivalsFields = ({ control }: { control: Control<FormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.items",
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Just Landed Items</h4>
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.items.${index}.image`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`content.items.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`content.items.${index}.badge`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`content.items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), title: "", image: "", badge: "", description: "", alt: "" })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
};

const CuratedItemsFields = ({ control }: { control: Control<FormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.curatedItems",
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Curated For You Items</h4>
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curated Item {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.curatedItems.${index}.image`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`content.curatedItems.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`content.curatedItems.${index}.badge`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`content.curatedItems.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), title: "", image: "", badge: "", description: "", alt: "" })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Curated Item
      </Button>
    </div>
  );
};

const PromoFields = ({ control }: { control: Control<FormValues> }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="content.image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background Image</FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="content.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="content.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="content.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="content.link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="content.linkText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Link Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="content.secondaryLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="content.secondaryLinkText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Link Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const TrendingFields = ({ control }: { control: Control<FormValues> }) => {
  return (
    <div className="space-y-8">
      <TrendingItemsFields control={control} />
      <EditItemsFields control={control} />
      <EditorialItemsFields control={control} />
    </div>
  );
};

const VideoBannerFields = ({ control }: { control: Control<FormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.videos",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.videos.${index}.video`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video</FormLabel>
                  <FormControl>
                    <VideoUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`content.videos.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`content.videos.${index}.badge`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`content.videos.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), title: "", video: "", badge: "", description: "", alt: "", products: [] })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Video
      </Button>
    </div>
  );
};
