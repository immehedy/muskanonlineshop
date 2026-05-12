"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  X,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
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

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-[280px] bg-slate-900 text-slate-100 transform transition-transform duration-200
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* ✅ Make the entire sidebar a flex column with full height */}
        <div className="h-dvh lg:h-screen flex flex-col">
          {/* Brand */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">Admin Panel</div>
                <div className="text-[11px] text-slate-300">Manage everything</div>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ✅ Nav grows + scrolls */}
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className="text-[11px] font-semibold text-slate-300 px-3 py-2">
              Navigation
            </div>

            <div className="space-y-1">
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={[
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-white/10 ring-1 ring-white/10 text-white"
                        : "text-slate-200 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-9 w-9 rounded-xl flex items-center justify-center ring-1 transition",
                        active
                          ? "bg-blue-500/15 ring-blue-500/30 text-blue-200"
                          : "bg-white/5 ring-white/10 text-slate-200 group-hover:text-white",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      <div className="text-[11px] font-medium text-slate-400 truncate">
                        {item.name === "Orders"
                          ? "Manage & dispatch"
                          : "Overview & analytics"}
                      </div>
                    </div>

                    {active && (
                      <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_0_3px_rgba(96,165,250,0.15)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ✅ Footer stays at bottom ALWAYS */}
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Settings className="h-5 w-5 text-slate-200" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">Quick tips</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <div>• Processing → dispatch</div>
                    <div>• Cancelled → cancel</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-3 px-1">
              © {new Date().getFullYear()} Admin • 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
