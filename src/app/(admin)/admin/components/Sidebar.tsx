"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  X,
  ShieldCheck,
  ChevronRight,
  Home,
  User,
} from "lucide-react";
import { useCurrentUser } from "@/packages/query/src/hooks/useCurrentUser";

const navigation = [
  {
    name: "ড্যাশবোর্ড",
    description: "ব্যবসার সারাংশ",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "অর্ডার",
    description: "অর্ডার দেখুন ও ম্যানেজ করুন",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
];

const adminOnlyNavigation = [
  {
    name: "ইউজার",
    description: "",
    href: "/admin/users",
    icon: User,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: currentUser } = useCurrentUser();

  console.log("data", currentUser)

  const menuItems =
    currentUser?.role === "admin"
      ? [...navigation, ...adminOnlyNavigation]
      : navigation;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform border-r border-slate-200 bg-white text-slate-900 shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-dvh flex-col lg:h-screen">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-black text-slate-950">
                  মুসকান অনলাইন শপ বিডি
                </div>
                <div className="truncate text-xs font-medium text-slate-500">
                  সহজ ম্যানেজমেন্ট
                </div>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              মেনু
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-700 group-hover:bg-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black">
                        {item.name}
                      </div>
                      <div
                        className={`mt-0.5 truncate text-xs font-medium ${
                          active ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-slate-200 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 transition hover:bg-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black">ওয়েবসাইটে যান</div>
                <div className="truncate text-xs text-slate-500">
                  কাস্টমার সাইট দেখুন
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}