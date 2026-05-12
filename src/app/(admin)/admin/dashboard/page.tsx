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

const statusText: Record<Order['status'], string> = {
  pending: 'অপেক্ষমান',
  processing: 'প্রসেসিং',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারড',
  cancelled: 'বাতিল',
}

const paymentText: Record<Order['paymentStatus'], string> = {
  pending: 'পেমেন্ট বাকি',
  paid: 'পেইড',
  failed: 'ব্যর্থ',
  refunded: 'রিফান্ডেড',
}

function statusBadge(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'processing':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
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

function paymentBadge(status: Order['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'failed':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    case 'refunded':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
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
  if (!Number.isFinite(n)) return '৳0'
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(n)
}

function dateTime(d: string) {
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(d))
}

function Stat({
  title,
  value,
  sub,
  icon,
  accent = 'bg-slate-50 text-slate-700 ring-slate-200',
}: {
  title: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 truncate text-3xl font-black tracking-tight text-slate-950">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      <Package className="h-10 w-10 text-slate-400" />
      <p className="mt-3 font-bold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
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
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const urgentCount = stats.pendingOrders + stats.processingOrders

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<ApiResponse>('/api/admin/dashboard')
      if (!response.success) throw new Error(`HTTP error! status: ${response.status}`)

      setStats(response.data as DashboardStats)
    } catch (e) {
      console.error('Error fetching dashboard stats:', e)
      setError('ড্যাশবোর্ডের তথ্য লোড করা যায়নি')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      setLoadingOrders(true)

      const params = new URLSearchParams({
        page: '1',
        limit: '6',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeStats: 'false',
      })

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()
      setRecentOrders((data?.orders || data?.data || []) as Order[])
    } catch (e) {
      console.error('Error fetching recent orders:', e)
    } finally {
      setLoadingOrders(false)
    }
  }

  const refreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchDashboardStats(), fetchRecentOrders()])
    setRefreshing(false)
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div>
              <p className="font-bold">ড্যাশবোর্ড লোড হচ্ছে</p>
              <p className="text-sm text-slate-500">অর্ডার ও রেভিনিউ তথ্য আনা হচ্ছে...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <div className="text-lg font-black text-rose-900">কিছু সমস্যা হয়েছে</div>
        <div className="mt-1 text-sm text-rose-700">{error}</div>
        <button
          onClick={refreshAll}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-300">অ্যাডমিন ড্যাশবোর্ড</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">আজকের অর্ডার ও সেলস ওভারভিউ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              পেন্ডিং অর্ডার, প্রসেসিং কিউ এবং সাম্প্রতিক অর্ডার দ্রুত দেখে প্রয়োজনীয় অ্যাকশন নিন।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              <ClipboardList className="h-4 w-4" />
              সব অর্ডার
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              রিফ্রেশ
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold text-slate-300">দ্রুত নজর দরকার</p>
            <p className="mt-1 text-2xl font-black">{urgentCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold text-slate-300">মোট রেভিনিউ</p>
            <p className="mt-1 text-2xl font-black">{money(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold text-slate-300">গড় অর্ডার ভ্যালু</p>
            <p className="mt-1 text-2xl font-black">{money(stats.averageOrderValue)}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="পেন্ডিং অর্ডার"
          value={String(stats.pendingOrders)}
          sub="রিভিউ / পেমেন্ট চেক দরকার"
          icon={<Package className="h-5 w-5" />}
          accent="bg-amber-50 text-amber-700 ring-amber-200"
        />
        <Stat
          title="প্রসেসিং অর্ডার"
          value={String(stats.processingOrders)}
          sub="ডিসপ্যাচ / কুরিয়ার প্রসেসে আছে"
          icon={<Boxes className="h-5 w-5" />}
          accent="bg-sky-50 text-sky-700 ring-sky-200"
        />
        <Stat
          title="মোট অর্ডার"
          value={String(stats.totalOrders)}
          sub="সব সময়ের হিসাব"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <Stat
          title="মোট রেভিনিউ"
          value={money(stats.totalRevenue)}
          sub={`গড় অর্ডার: ${money(stats.averageOrderValue)}`}
          icon={<Banknote className="h-5 w-5" />}
          accent="bg-emerald-50 text-emerald-700 ring-emerald-200"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">সাম্প্রতিক অর্ডার</h2>
              <p className="mt-1 text-sm text-slate-500">শেষ {recentOrders.length}টি অর্ডারের দ্রুত তালিকা</p>
            </div>

            <div className="relative w-full sm:w-[340px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="অর্ডার / কাস্টমার / ইমেইল খুঁজুন..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="mt-5">
            {loadingOrders ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-12 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                সাম্প্রতিক অর্ডার লোড হচ্ছে...
              </div>
            ) : filteredRecent.length === 0 ? (
              <EmptyState title="কোনো অর্ডার পাওয়া যায়নি" description="আপনার সার্চ অনুযায়ী কোনো সাম্প্রতিক অর্ডার মিলেনি।" />
            ) : (
              <div className="space-y-3">
                {filteredRecent.map((o) => {
                  const name = `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.trim()
                  const itemsCount = o.items?.reduce((t, it) => t + (it.quantity || 0), 0) || o.items?.length || 0

                  return (
                    <Link
                      key={o._id}
                      href={`/admin/orders/${o._id}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-950">#{o.orderNumber}</span>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusBadge(o.status)}`}>
                              {statusIcon(o.status)}
                              {statusText[o.status]}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${paymentBadge(o.paymentStatus)}`}>
                              {paymentText[o.paymentStatus]}
                            </span>
                          </div>

                          <p className="mt-2 truncate text-sm font-semibold text-slate-700">
                            {name || 'কাস্টমার'}
                            {o.shippingAddress?.email ? <span className="font-normal text-slate-500"> · {o.shippingAddress.email}</span> : null}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
                              <Package className="h-3.5 w-3.5" />
                              {itemsCount} আইটেম
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
                              <Banknote className="h-3.5 w-3.5" />
                              {money(o.total)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
                              <Timer className="h-3.5 w-3.5" />
                              {dateTime(o.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
            >
              সব অর্ডার দেখুন
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">দ্রুত অ্যাকশন</h2>
            <p className="mt-1 text-sm text-slate-500">প্রতিদিনের কাজগুলো দ্রুত করুন</p>

            <div className="mt-5 grid gap-3">
              <Link
                href="/admin/orders?status=pending"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-amber-200 hover:bg-amber-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">পেন্ডিং রিভিউ</p>
                    <p className="truncate text-xs text-slate-500">অপেক্ষমান অর্ডার প্রসেস করুন</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-amber-700" />
                </div>
              </Link>

              <Link
                href="/admin/orders?status=processing"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">প্রসেসিং কিউ</p>
                    <p className="truncate text-xs text-slate-500">ডিসপ্যাচ ও কুরিয়ার ফলোআপ</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-sky-700" />
                </div>
              </Link>

              <Link
                href="/admin/orders"
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">অর্ডার ম্যানেজ</p>
                    <p className="truncate text-xs text-slate-500">সার্চ, আপডেট, ক্যানসেল</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">পরবর্তী উন্নতি</h2>
            <p className="mt-1 text-sm text-slate-500">ড্যাশবোর্ডকে আরও শক্তিশালী করতে পারেন</p>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="font-bold text-slate-900">রেভিনিউ ট্রেন্ড চার্ট</p>
                <p className="mt-1 text-xs text-slate-500">তারিখভিত্তিক stats endpoint থাকলে সহজে যোগ করা যাবে।</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="font-bold text-slate-900">লো-স্টক অ্যালার্ট</p>
                <p className="mt-1 text-xs text-slate-500">ইনভেন্টরি ডেটা থাকলে দ্রুত সতর্কতা দেখানো যাবে।</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="font-bold text-slate-900">টপ কাস্টমার</p>
                <p className="mt-1 text-xs text-slate-500">রিপিট কাস্টমার ও হাই ভ্যালু কাস্টমার ট্র্যাক করুন।</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
