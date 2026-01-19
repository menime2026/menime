"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_LINKS } from "../_constants/nav-links";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();

  return (
  <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-white lg:sticky lg:top-0 lg:block">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-8">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center ">
            <Image
              src="/logo-new.png"
              alt="Meni-me logo"
              width={60}
              height={60}
              priority
            />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Meni-me</p>
            <p className="text-lg font-light uppercase tracking-[0.2em] text-slate-900">Admin</p>
          </div>
        </Link>
      </div>
      <nav className="flex h-[calc(100%-5rem)] flex-col gap-2 overflow-y-auto p-6">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname?.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
