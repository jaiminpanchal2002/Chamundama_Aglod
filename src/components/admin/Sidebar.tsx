"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  href: string;
  label: string;
  perm?: string;
}
export interface SidebarGroup {
  label: string;
  perm?: string;
  items: SidebarItem[];
}

export function Sidebar({
  groups,
  user,
  signOutAction,
}: {
  groups: SidebarGroup[];
  user: { name: string; role: string };
  signOutAction: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 top-4 z-50 rounded-md bg-temple-maroon p-2 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-temple-gold">ॐ</span>
              <div>
                <p className="font-display text-sm text-temple-maroon">
                  Chamunda Dham
                </p>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {groups.map((g) => (
              <div key={g.label} className="mb-4">
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {g.label}
                </p>
                <ul className="space-y-0.5">
                  {g.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition",
                          isActive(item.href)
                            ? "bg-temple-maroon text-white"
                            : "text-slate-600 hover:bg-slate-100",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{user.name}</p>
            <p className="mb-3 text-xs text-slate-400">{user.role}</p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
