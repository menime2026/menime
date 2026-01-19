"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
  Settings,
  Bell,
  LogOut,
  Package,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchSheet } from "@/components/layout/search-sheet";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MENUITEMS } from "@/app/admin/_constants/nav-links";
import { useNotifications } from "@/components/providers/notification-provider";
import { formatDistanceToNow } from "date-fns";
import { useUser, useClerk } from "@clerk/nextjs";


type NavbarProps = {
  initialCartCount?: number;
  initialWishlistSize?: number; // Renamed from initialWishlistCount
};

type CommerceCounts = {
  cartCount: number;
  wishlistCount: number;
};

const commerceCountsQueryKey = ["commerce-counts"] as const;

const getInitials = (name?: string | null, fallback?: string | null) => {
  if (name && name.trim().length > 0) {
    const tokens = name.trim().split(/\s+/);
    const first = tokens[0]?.[0] ?? "";
    const second =
      tokens.length > 1 ? tokens[tokens.length - 1]?.[0] ?? "" : "";
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

export const Navbar = ({
  initialCartCount,
  initialWishlistSize,
}: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(
    new Set()
  );
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const { openModal } = useAuthModal();

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionsMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Fetch profile from database to get updated avatar and role
  const { data: profileData } = useQuery<{ image?: string | null; role?: string }>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: isSignedIn,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Use database image if available, otherwise fall back to Clerk image
  const userImage = profileData?.image || clerkUser?.imageUrl || null;

  const user = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || null,
    email: clerkUser.primaryEmailAddress?.emailAddress || null,
    image: userImage,
    role: profileData?.role || (clerkUser.publicMetadata?.role as string) || "CUSTOMER",
  } : null;

  const isAdmin = Boolean(user && user.role === "ADMIN");

  // Use initialWishlistSize for the memoized initial counts
  const normalizedInitialCounts = useMemo(() => {
    return {
      cartCount: Math.max(0, initialCartCount ?? 0),
      wishlistCount: Math.max(0, initialWishlistSize ?? 0),
    } satisfies CommerceCounts;
  }, [initialCartCount, initialWishlistSize]);

  useEffect(() => {
    queryClient.setQueryData<CommerceCounts>(
      commerceCountsQueryKey,
      normalizedInitialCounts
    );
  }, [normalizedInitialCounts, queryClient]);

  const { data: commerceCounts } = useQuery<CommerceCounts>({
    queryKey: commerceCountsQueryKey,
    queryFn: async () => {
      const response = await fetch("/api/storefront/commerce-counts", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        return { cartCount: 0, wishlistCount: 0 } satisfies CommerceCounts;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch commerce counts");
      }

      const payload = (await response.json()) as Partial<CommerceCounts>;

      return {
        cartCount: Math.max(0, Number(payload.cartCount) || 0),
        wishlistCount: Math.max(0, Number(payload.wishlistCount) || 0),
      } satisfies CommerceCounts;
    },
    initialData: normalizedInitialCounts,
    enabled: Boolean(user),
    staleTime: 30_000,
    retry: false,
  });

  const cartCount = Math.max(
    0,
    commerceCounts?.cartCount ?? normalizedInitialCounts.cartCount
  );
  const wishlistCount = Math.max(
    0,
    commerceCounts?.wishlistCount ?? normalizedInitialCounts.wishlistCount
  );

  const userInitials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email]
  );

  const userAvatar = useMemo(() => resolveUserAvatarUrl(user), [user]);

  useEffect(() => {
    const handleResize = () => {
      // Mobile layout for screens < 1024px (lg)
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen && !isNotificationsOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (isUserMenuOpen) {
        if (
          !userMenuRef.current?.contains(target) &&
          !userMenuButtonRef.current?.contains(target)
        ) {
          setIsUserMenuOpen(false);
        }
      }

      if (isNotificationsOpen) {
        if (
          !notificationsRef.current?.contains(target) &&
          !notificationsButtonRef.current?.contains(target) &&
          !mobileNotificationsRef.current?.contains(target) &&
          !mobileNotificationsButtonRef.current?.contains(target)
        ) {
          setIsNotificationsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isUserMenuOpen, isNotificationsOpen]);

  useEffect(() => {
    if (!isActionsMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (
        actionsMenuRef.current?.contains(target) ||
        actionsMenuButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsActionsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isActionsMenuOpen]);

  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleMouseEnter = (label: string) => {
    if (isMobile) {
      return;
    }

    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }

    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (isMobile) {
      return;
    }

    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }

    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);

    setDropdownTimeout(timeout);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  const toggleMobileExpand = (label: string) => {
    setExpandedMobileItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleToggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const handleToggleActionsMenu = () => {
    setIsActionsMenuOpen((prev) => !prev);
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsUserMenuOpen(false);
  };

  const renderNotificationsContent = () => {
    const recentNotifications = notifications.slice(0, 3);

    return (
      <div className="flex flex-col gap-2 p-4 text-sm w-72">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
          Notifications
        </p>
        {recentNotifications.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            No new notifications
          </p>
        ) : (
          recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                !notification.read ? "bg-red-50/50" : ""
              }`}
              onClick={() => {
                markAsRead(notification.id);
                if (notification.link) {
                  router.push(notification.link);
                  setIsNotificationsOpen(false);
                }
              }}
            >
              {!notification.read && (
                <div className="h-2 w-2 mt-1.5 rounded-full bg-red-600 shrink-0" />
              )}
              <div className={!notification.read ? "" : "ml-5"}>
                <p className="font-semibold text-gray-900 text-xs">
                  {notification.title}
                </p>
                <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-gray-400 text-[9px] mt-1">
                  {formatDistanceToNow(new Date(notification.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div className="text-center mt-2 pt-2 border-t border-gray-100">
          <Link
            href="/notifications"
            className="text-[10px] text-gray-500 hover:text-gray-900 underline"
            onClick={() => setIsNotificationsOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </div>
    );
  };

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut();
      queryClient.setQueryData<CommerceCounts>(commerceCountsQueryKey, {
        cartCount: 0,
        wishlistCount: 0,
      });
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  const handleOpenAuthModal = (view: "sign-in" | "sign-up") => {
    openModal(view);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const renderUserMenuContent = () => {
    if (!user) {
      return (
        <div className="flex flex-col gap-2 p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            Welcome to Meni Me&apos;s
          </p>
          <button
            onClick={() => handleOpenAuthModal("sign-in")}
            className="rounded-full bg-gray-900 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-gray-800"
          >
            Log in / Join
          </button>
          <button
            onClick={() => handleOpenAuthModal("sign-up")}
            className="rounded-full border border-gray-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-700 transition hover:bg-gray-100"
          >
            Create account
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 p-4 text-sm">
        <div className="rounded-2xl bg-gray-50 p-3 text-xs uppercase tracking-[0.35em] text-gray-500">
          Hello, {user.name ?? user.email ?? "Explorer"}
        </div>
        <Link
          href="/profile"
          className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
          onClick={() => setIsUserMenuOpen(false)}
        >
          Profile
        </Link>
        <Link
          href="/orders"
          className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
          onClick={() => setIsUserMenuOpen(false)}
        >
          Orders
        </Link>
        <Link
          href="/wishlist"
          className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
          onClick={() => setIsUserMenuOpen(false)}
        >
          Wishlist
        </Link>
        <Link
          href="/cart"
          className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
          onClick={() => setIsUserMenuOpen(false)}
        >
          Cart
        </Link>
        {isAdmin ? (
          <Link
            href="/admin/dashboard"
            className="rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
            onClick={() => setIsUserMenuOpen(false)}
          >
            Admin dashboard
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-700 transition hover:bg-gray-100"
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white">
      {/* Mobile Navbar (< 1024px) */}
      <nav className="border-b border-gray-200 flex items-center justify-between px-4 py-3 sm:px-4 sm:py-3 lg:hidden relative">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 h-9 w-9 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={20} className="text-gray-900" />
            ) : (
              <Menu size={20} className="text-gray-900" />
            )}
          </button>

          <SheetContent
            side="left"
            className="w-[70%] max-w-sm p-0 flex flex-col overflow-hidden"
          >
            <SheetHeader className="border-b border-gray-200 px-4 py-4 ">
              <SheetTitle className="sr-only">Site navigation menu</SheetTitle>
              <SheetDescription className="sr-only">
                Browse product categories, account links, and quick actions.
              </SheetDescription>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-0">
                  <div className="relative h-10 w-16">
                    <Image
                      src="/logo-new.png"
                      alt="Menime logo"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                  {/* <span className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.15em]">
                    Meni Me
                  </span> */}
                </div>
                <SheetClose />
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* User Profile / Welcome Section */}
              <div className="px-4 py-6 bg-gray-50 mb-2">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      {userAvatar ? (
                        <Image
                          src={userAvatar}
                          alt={user.name ?? "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white text-sm font-bold">
                          {userInitials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.name ?? "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-900 text-white text-sm font-bold">
                      W
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Welcome!</p>
                      <p className="text-xs text-gray-600">
                        Sign in for the best experience
                      </p>
                    </div>
                  </div>
                )}

                {/* Mobile Quick Actions */}
                {user ? (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
                    >
                      <User size={16} className="text-gray-700" />
                      <span className="text-[9px] font-bold uppercase text-gray-600">Profile</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
                    >
                      <Heart size={16} className="text-gray-700" />
                      <span className="text-[9px] font-bold uppercase text-gray-600">Wishlist</span>
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
                    >
                      <div className="relative">
                        <Bell size={16} className="text-gray-700" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase text-gray-600">Notifs</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform"
                    >
                      <Package size={16} className="text-gray-700" />
                      <span className="text-[9px] font-bold uppercase text-gray-600">Orders</span>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOpenAuthModal("sign-in")}
                      className="rounded-lg bg-gray-900 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm active:scale-95 transition-transform"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => handleOpenAuthModal("sign-up")}
                      className="rounded-lg border border-gray-300 bg-white py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm active:scale-95 transition-transform"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="px-4">
                {MENUITEMS.map((item) => {
                  const isExpanded = expandedMobileItems.has(item.label);
                  const hasSubmenu =
                    (item.type === "simple" &&
                      item.sublinks &&
                      item.sublinks.length > 0) ||
                    item.type === "mega";

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={item.href}
                          className={`flex-1 block border-b border-gray-100 py-3 sm:py-4 text-xs sm:text-xs font-bold uppercase tracking-[0.4em] transition-colors duration-150 ${
                            item.isSale
                              ? "text-red-600"
                              : "text-gray-900 hover:text-red-600"
                          } active:bg-gray-50`}
                          onClick={() => {
                            if (!hasSubmenu) {
                              setIsMenuOpen(false);
                            }
                          }}
                        >
                          {item.label}
                        </Link>
                        {hasSubmenu && (
                          <button
                            type="button"
                            onClick={() => toggleMobileExpand(item.label)}
                            className="border-b border-gray-100 py-3 sm:py-4 px-2 text-gray-700 transition-colors duration-150 hover:text-red-600 active:bg-gray-50"
                            aria-label={
                              isExpanded
                                ? `Collapse ${item.label}`
                                : `Expand ${item.label}`
                            }
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Simple Menu Sublinks */}
                      {isExpanded &&
                      item.type === "simple" &&
                      item.sublinks &&
                      item.sublinks.length > 0 ? (
                        <div className="bg-gray-50 py-2 animate-in slide-in-from-top-2 duration-300">
                          {item.sublinks.map((sublink) => (
                            <Link
                              key={sublink.label}
                              href={sublink.href}
                              className="block px-4 py-3 sm:py-4 text-xs text-gray-600 transition-colors duration-150 hover:text-red-600 hover:bg-gray-100 active:bg-gray-200 rounded"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sublink.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      {/* Mega Menu - All Columns Visible */}
                      {isExpanded && item.type === "mega" ? (
                        <div className="space-y-4 bg-gray-50 py-4 px-4 animate-in slide-in-from-top-2 duration-300">
                          {item.columns.map((column) => (
                            <div key={column.title}>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-500 mb-3">
                                {column.title}
                              </p>
                              <ul className="space-y-1">
                                {column.links.map((link) => (
                                  <li key={link.label}>
                                    <Link
                                      href={link.href}
                                      className="block text-xs text-gray-600 transition-colors duration-150 hover:text-red-600 hover:bg-gray-100 active:bg-gray-200 px-3 py-2.5 sm:py-3 rounded"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Contact Us Section */}
              <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                <button className="flex items-center gap-3 text-gray-900 font-bold text-xs uppercase tracking-[0.3em] hover:text-red-600 transition">
                  <span>☎</span>
                  Contact Us
                </button>
              </div>

              {/* Additional Help Section */}
              <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                <button className="flex items-center gap-3 text-gray-900 font-bold text-xs uppercase tracking-[0.3em] hover:text-red-600 transition">
                  <span>?</span>
                  Help & Support
                </button>
              </div>

              {/* Log Out Section */}
              {user && (
                <div className="border-t border-gray-200 mt-4 pt-4 pb-8 px-4">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-red-600 font-bold text-xs uppercase tracking-[0.3em] hover:text-red-700 transition w-full"
                    disabled={isSigningOut}
                  >
                    <LogOut size={16} />
                    {isSigningOut ? "Signing out..." : "Log Out"}
                  </button>
                </div>
              )}

              {!user && <div className="pb-8" />}
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo with Company Name */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0"
          aria-label="Menime home"
        >
          <div className="relative h-10 w-16 sm:h-12 sm:w-20">
            <Image
              src="/logo-new.png"
              alt="Menime logo"
              fill
              sizes="(max-width: 640px) 48px, 56px"
              className="object-contain"
              priority
            />
          </div>

        </Link>

        {/* Right: Action Icons (Search & Cart only for mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Icon */}
          <button
            onClick={toggleSearch}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50"
            aria-label="Toggle search"
          >
            <Search size={18} className="text-gray-900" />
          </button>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50 relative"
          >
            <ShoppingBag size={18} className="text-gray-900" />
            {cartCount > 0 ? (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </nav>

      {/* Search Sheet */}
      <SearchSheet open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* The previous implementation of the mobile menu is removed */}

      {/* Medium & Desktop Navigation (≥ 1024px) */}
      <nav className="hidden lg:block border-b border-gray-200 relative">
        <div className="flex items-start justify-between gap-4 lg:gap-8 px-4 md:px-6 lg:px-8 py-4">
          {/* Logo with Company Name */}
          <Link
            href="/"
            className="flex flex-col items-center gap-0"
            aria-label="Menime home"
          >
            <div className="relative h-10 w-16">
              <Image
                src="/logo-new.png"
                alt="Menime logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>

          </Link>

          <div className="hidden w-full lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-8">
            {MENUITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`relative pb-1 text-xs font-bold uppercase tracking-[0.4em] transition-colors duration-200 ${
                    item.isSale
                      ? "text-red-600 hover:text-red-700"
                      : "text-gray-900 hover:text-red-600"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                      activeDropdown === item.label ? "w-full" : "w-0"
                    }`}
                  />
                </Link>

                {activeDropdown === item.label && item.type === "mega" ? (
                  <div className="fixed left-0 right-0 top-22 bg-white shadow-lg lg:top-20">
                    <div className="mx-auto max-w-7xl px-8 py-12">
                      <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-5">
                        {item.columns.map((column) => (
                          <div key={column.title}>
                            <h3 className="mb-6 border-b border-gray-200 pb-2 text-xs font-bold uppercase tracking-[0.4em] text-gray-900">
                              {column.title}
                            </h3>
                            <ul className="space-y-3">
                              {column.links.map((link) => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    className="text-sm text-gray-700 transition-colors duration-150 hover:text-red-600"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {item.image ? (
                          <div className="hidden justify-end lg:flex lg:col-start-5">
                            <div className="relative h-64 w-48 overflow-hidden rounded-lg bg-linear-to-br from-gray-200 to-gray-300">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={`${item.label} collection`}
                                fill
                                sizes="192px"
                                className="object-cover"
                                priority
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeDropdown === item.label &&
                item.type === "simple" &&
                item.sublinks &&
                item.sublinks.length > 0 ? (
                  <div className="fixed left-0 right-0 top-22 bg-white shadow-lg lg:top-20">
                    <div className="mx-auto max-w-7xl px-8 py-8">
                      <ul className="space-y-4">
                        {item.sublinks.map((sublink) => (
                          <li key={sublink.label}>
                            <Link
                              href={sublink.href}
                              className="block text-sm text-gray-700 transition-colors duration-150 hover:text-red-600"
                            >
                              {sublink.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50 p-2"
              aria-label="Toggle search"
            >
              <Search size={18} className="text-gray-900" />
            </button>

            {/* Notifications/Offers Icon */}
            <div className="relative">
              <button
                ref={notificationsButtonRef}
                onClick={handleToggleNotifications}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50 p-2 relative"
              >
                <Bell size={20} className="text-gray-900" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen ? (
                <div
                  ref={notificationsRef}
                  className="absolute right-0 top-full mt-3 w-72 rounded-lg border border-gray-200 bg-white shadow-xl z-50"
                >
                  {renderNotificationsContent()}
                </div>
              ) : null}
            </div>

            <Link
              href="/wishlist"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50 p-2 relative"
            >
              <Heart size={20} className="text-gray-900" />
              {wishlistCount > 0 ? (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 transition-colors duration-200 hover:text-red-600 hover:border-red-300 active:bg-gray-50 p-2 relative"
            >
              <ShoppingBag size={20} className="text-gray-900" />
              {cartCount > 0 ? (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {/* User Account Menu */}
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                type="button"
                onClick={handleToggleUserMenu}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 p-2"
                aria-label="Account menu"
              >
                <span className="sr-only">
                  {user ? "Open account menu" : "Open login menu"}
                </span>
                {user ? (
                  userAvatar ? (
                    <span className="relative flex h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                      <Image
                        src={userAvatar || "/placeholder.svg"}
                        alt={user.name ?? user.email ?? "User avatar"}
                        width={32}
                        height={32}
                        sizes="32px"
                        className="h-full w-full object-cover"
                        priority
                      />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold uppercase tracking-widest text-white">
                      {userInitials || <User className="h-4 w-4" />}
                    </span>
                  )
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/10 text-gray-900">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </button>

              {isUserMenuOpen ? (
                <div
                  ref={userMenuRef}
                  className="fixed left-0 right-0 top-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-white border-t border-gray-200 md:absolute md:top-full md:left-auto md:right-0 md:bottom-auto md:mt-3 md:w-64 md:rounded-3xl md:border md:border-gray-200 md:border-t-0 md:bg-white md:shadow-xl"
                >
                  <div className="md:hidden flex items-center justify-between sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
                    <h2 className="text-sm font-bold text-gray-900">Account</h2>
                    <button
                      onClick={() => setIsUserMenuOpen(false)}
                      className="inline-flex items-center justify-center h-8 w-8 text-gray-600 hover:text-gray-900 transition"
                      aria-label="Close account menu"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {renderUserMenuContent()}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
