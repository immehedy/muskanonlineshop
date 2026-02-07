'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut,
  Menu,
  LayoutDashboard,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

function titleFromPath(pathname: string) {
  if (pathname.startsWith('/admin/orders')) return 'Orders'
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard'
  return 'Admin'
}

function iconFromPath(pathname: string) {
  if (pathname.startsWith('/admin/orders')) return ShoppingCart
  if (pathname.startsWith('/admin/dashboard')) return LayoutDashboard
  return ShieldCheck
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const title = titleFromPath(pathname)
  const Icon = iconFromPath(pathname)

  const handleLogout = async () => {
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: menu + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
              <div className="flex items-center gap-1 text-[12px] text-slate-500 truncate">
                <Link href="/admin/dashboard" className="hover:text-slate-700">
                  Admin
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="truncate">{title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Small profile pill placeholder */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Admin</div>
              <div className="text-[11px] text-slate-500">Online</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
