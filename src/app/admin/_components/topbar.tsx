"use client";

import { Menu, Search, UserCircle, Home, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/nextjs";
import { ADMIN_NAV_LINKS } from "../_constants/nav-links";

const getInitials = (name?: string | null, fallback?: string | null) => {
  if (name && name.trim().length > 0) {
    const tokens = name.trim().split(/\s+/);
    const first = tokens[0]?.[0] ?? "";
    const second = tokens.length > 1 ? tokens[tokens.length - 1]?.[0] ?? "" : "";
    return (first + second).toUpperCase();
  }

  if (fallback && fallback.length > 0) {
    return fallback[0]?.toUpperCase() ?? "";
  }

  return "";
};

const resolveUserAvatarUrl = (user: unknown): string | null => {
  if (!user || typeof user !== "object") {
    return null;
  }

  const record = user as Record<string, unknown>;
  const candidateKeys = [
    "image",
    "imageUrl",
    "avatarUrl",
    "profileImage",
    "photoURL",
    "picture",
  ] as const;

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  const avatar = record.avatar;
  if (avatar && typeof avatar === "object") {
    const url = (avatar as Record<string, unknown>).url;
    if (typeof url === "string") {
      const trimmed = url.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  const profile = record.profile;
  if (profile && typeof profile === "object") {
    const profileRecord = profile as Record<string, unknown>;
    const value = profileRecord.image ?? profileRecord.picture ?? profileRecord.photoURL;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return null;
};

const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-slate-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="absolute left-0 right-0 top-20 z-40 border-b border-slate-100 bg-white shadow-lg">
          <nav className="flex flex-col gap-2 px-6 py-6">
            {ADMIN_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-widest",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
};

const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const user = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || null,
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    image: clerkUser.imageUrl || null,
  } : null;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const userInitials = useMemo(() => getInitials(user?.name, user?.email), [user?.name, user?.email]);
  const userAvatar = useMemo(() => resolveUserAvatarUrl(user), [user]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (userMenuRef.current?.contains(target) || userMenuButtonRef.current?.contains(target)) {
        return;
      }
      setIsUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isUserMenuOpen]);

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut();
      setIsUserMenuOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  const activeTitle =
    ADMIN_NAV_LINKS.find((link) => pathname?.startsWith(link.href))?.label ??
    "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-100 bg-white px-8">
      <MobileSidebar />
      <div className="flex flex-1 items-center gap-6">
        <h1 className="text-xl font-light uppercase tracking-widest text-slate-900">{activeTitle}</h1>
        <div className="relative hidden w-full max-w-sm items-center lg:flex">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-xs font-medium outline-none transition focus:border-slate-400 focus:bg-white focus:ring-0"
            placeholder="Search admin..."
            type="search"
            aria-label="Search"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="hidden h-10 rounded-full border-slate-200 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 lg:inline-flex">
          Quick actions
        </Button>
        <div className="relative">
          <button
            ref={userMenuButtonRef}
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300"
            aria-label="Open account menu"
          >
            {user ? (
              userAvatar ? (
                <span className="relative h-full w-full overflow-hidden rounded-full">
                  <Image
                    src={userAvatar}
                    alt={user.name ?? user.email ?? "User avatar"}
                    fill
                    sizes="40px"
                    className="object-cover"
                    priority
                  />
                </span>
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-white">
                  {userInitials || <UserCircle className="h-5 w-5" />}
                </span>
              )
            ) : (
              <UserCircle className="h-5 w-5 text-slate-600" />
            )}
          </button>

          {isUserMenuOpen ? (
            <div
              ref={userMenuRef}
              className="absolute right-0 top-full mt-4 w-72 rounded-4xl border border-slate-100 bg-white p-4 shadow-xl"
            >
              <div className="rounded-3xl bg-slate-50 p-4 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signed in as</p>
                <p className="mt-1 font-medium text-slate-900">{user?.name ?? user?.email ?? "Admin"}</p>
              </div>
              <div className="mt-4 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Go to storefront
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out…" : "Log out"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
