'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/checkout'
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Boxes,
  ClipboardList,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Timer,
  Truck,
} from 'lucide-react'

interface DashboardStats {
  averageOrderValue: number
  pendingOrders: number
  processingOrders: number
  totalOrders: number
  totalRevenue: number
}

type Order = {
  _id: string
  orderNumber: string
  shippingAddress: {
    firstName: string
    lastName: string
    email?: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  createdAt: string
  items: Array<{ id: string; name?: string; quantity: number }>
  deliveryProvider?: string | null
  consignmentId?: string | null
}

function statusBadge(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'processing':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    case 'shipped':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    default:
      return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
  }
}

function statusIcon(status: Order['status']) {
  switch (status) {
    case 'pending':
      return <Timer className="h-4 w-4" />
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />
    case 'shipped':
      return <Truck className="h-4 w-4" />
    case 'delivered':
      return <BadgeCheck className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

function money(n: number) {
  if (!Number.isFinite(n)) return '৳0.00'
  return `৳${n.toFixed(2)}`
}

function Stat({
  title,
  value,
  sub,
  icon,
}: {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    processingOrders: 0,
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // small search box for the "recent orders" list
  const [q, setQ] = useState('')

  const filteredRecent = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return recentOrders
    return recentOrders.filter((o) => {
      const name = `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.toLowerCase()
      return (
        o.orderNumber?.toLowerCase().includes(s) ||
        name.includes(s) ||
        (o.shippingAddress?.email || '').toLowerCase().includes(s)
      )
    })
  }, [q, recentOrders])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse>('/api/admin/dashboard')
      if (!response.success) throw new Error(`HTTP error! status: ${response.status}`)

      setStats(response.data as DashboardStats)
    } catch (e) {
      console.error('Error fetching dashboard stats:', e)
      setError('Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      setLoadingOrders(true)

      // Uses your existing orders endpoint (getAllOrders)
      // NOTE: it expects sortBy & sortOrder on your backend options
      const params = new URLSearchParams({
        page: '1',
        limit: '6',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()

      // most likely data.orders exists
      setRecentOrders((data?.orders || data?.data || []) as Order[])
    } catch (e) {
      console.error('Error fetching recent orders:', e)
      // don’t block dashboard if this fails
    } finally {
      setLoadingOrders(false)
    }
  }

  const refreshAll = async () => {
    await Promise.all([fetchDashboardStats(), fetchRecentOrders()])
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div className="font-medium">Loading dashboard…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-5">
        <div className="text-rose-800 font-semibold">Something went wrong</div>
        <div className="text-rose-700 text-sm mt-1">{error}</div>
        <button
          onClick={refreshAll}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Overview of orders & revenue — quick actions for admin.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ClipboardList className="h-4 w-4" />
            Manage Orders
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          title="Pending Orders"
          value={String(stats.pendingOrders)}
          sub="Need review / payment check"
          icon={<Package className="h-5 w-5 text-slate-700" />}
        />

        <Stat
          title="Processing Orders"
          value={String(stats.processingOrders)}
          sub="Dispatch / courier handling"
          icon={<Boxes className="h-5 w-5 text-slate-700" />}
        />

        <Stat
          title="Total Orders"
          value={String(stats.totalOrders)}
          sub="All time"
          icon={<ShoppingCart className="h-5 w-5 text-slate-700" />}
        />

        <Stat
          title="Total Revenue"
          value={money(stats.totalRevenue)}
          sub={`Avg order: ${money(stats.averageOrderValue)}`}
          icon={<Banknote className="h-5 w-5 text-slate-700" />}
        />
      </div>

      {/* Two columns on desktop; stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">Recent Orders</div>
              <div className="text-sm text-slate-500">
                Latest activity (last {recentOrders.length} orders)
              </div>
            </div>

            <div className="relative w-full sm:w-[320px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search order / customer…"
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          </div>

          <div className="mt-4">
            {loadingOrders ? (
              <div className="flex items-center gap-2 text-slate-600 py-10 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recent orders…
              </div>
            ) : filteredRecent.length === 0 ? (
              <div className="text-slate-500 text-sm py-10 text-center">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecent.map((o) => {
                  const name = `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.trim()
                  return (
                    <Link
                      key={o._id}
                      href={`/admin/orders/${o._id}`}
                      className="block rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">
                              {o.orderNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(
                                o.status
                              )}`}
                            >
                              {statusIcon(o.status)}
                              {o.status}
                            </span>
                          </div>

                          <div className="mt-1 text-sm text-slate-600 truncate">
                            {name || 'Customer'} {o.shippingAddress?.email ? `• ${o.shippingAddress.email}` : ''}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                              <Package className="h-3.5 w-3.5" />
                              Items: {o.items?.reduce((t, it) => t + (it.quantity || 0), 0) || o.items?.length || 0}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                              <Banknote className="h-3.5 w-3.5" />
                              {money(o.total)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                              <Timer className="h-3.5 w-3.5" />
                              {new Date(o.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              View all orders
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick actions / placeholders */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
            <div className="text-lg font-bold text-slate-900">Quick Actions</div>
            <div className="text-sm text-slate-500 mt-1">Common admin shortcuts</div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link
                href="/admin/orders?status=pending"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center">
                  <Package className="h-5 w-5 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">Review Pending</div>
                  <div className="text-xs text-slate-500 truncate">Orders waiting for processing</div>
                </div>
              </Link>

              <Link
                href="/admin/orders?status=processing"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 ring-1 ring-blue-200 flex items-center justify-center">
                  <Boxes className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">Processing Queue</div>
                  <div className="text-xs text-slate-500 truncate">Dispatch + courier workflow</div>
                </div>
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-slate-700" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">All Orders</div>
                  <div className="text-xs text-slate-500 truncate">Search, update, cancel</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
            <div className="text-lg font-bold text-slate-900">Notes</div>
            <div className="text-sm text-slate-500 mt-1">
              You can plug in low-stock / users later.
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
              If you want, I can also add:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li>“Revenue trend” chart (needs a stats endpoint by date)</li>
                <li>Top customers list (you already have an aggregate)</li>
                <li>Status breakdown widget</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
