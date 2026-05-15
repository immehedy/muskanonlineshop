"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useLogout } from "@/packages/query/src/hooks/auth/useLogout";

function titleFromPath(pathname: string) {
  if (pathname.startsWith("/admin/orders")) return "অর্ডার";
  if (pathname.startsWith("/admin/dashboard")) return "ড্যাশবোর্ড";
  if (pathname.startsWith("/admin/users")) return "ইউজার";
  return "অ্যাডমিন";
}

function subtitleFromPath(pathname: string) {
  if (pathname.startsWith("/admin/orders"))
    return "অর্ডার দেখুন ও ম্যানেজ করুন";

  if (pathname.startsWith("/admin/dashboard"))
    return "ব্যবসার সারাংশ দেখুন";

  if (pathname.startsWith("/admin/users"))
    return "ইউজার ম্যানেজমেন্ট";

  return "অ্যাডমিন প্যানেল";
}

function iconFromPath(pathname: string) {
  if (pathname.startsWith("/admin/orders")) return ShoppingCart;
  if (pathname.startsWith("/admin/dashboard")) return LayoutDashboard;
  return ShieldCheck;
}

export function Header({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const logoutMutation = useLogout();

  const title = titleFromPath(pathname);
  const subtitle = subtitleFromPath(pathname);
  const Icon = iconFromPath(pathname);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/login");
        router.refresh();
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-slate-950 md:text-lg">
              {title}
            </h1>

            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="
              inline-flex items-center gap-2 rounded-xl
              bg-slate-900 px-3 py-2
              text-sm font-bold text-white
              transition hover:bg-slate-800
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">
              {logoutMutation.isPending
                ? "লগআউট হচ্ছে..."
                : "লগআউট"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}