'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Search,
  Filter,
  CalendarDays,
  User,
  Phone,
  Package,
  BadgeCheck,
  Truck,
  Timer,
  XCircle,
  Banknote,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
} from 'lucide-react'

interface Order {
  _id: string
  orderNumber: string
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
    country: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  total: number
  createdAt: string
  estimatedDelivery: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  consignmentId?: string | null
  deliveryProvider?: string | null
}

type StatusFilter = 'all' | Order['status']

type OrdersResponse = {
  orders?: Order[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  currentPage?: number
  totalPages?: number
}

const ORDER_LIMIT = 12

const statusLabel: Record<Order['status'], string> = {
  pending: 'নতুন অর্ডার',
  processing: 'প্রসেসিং চলছে',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
}

function statusPill(status: Order['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'shipped':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function statusIcon(status: Order['status']) {
  switch (status) {
    case 'pending':
      return <Timer className="h-3.5 w-3.5" />
    case 'processing':
      return <Truck className="h-3.5 w-3.5" />
    case 'shipped':
      return <Package className="h-3.5 w-3.5" />
    case 'delivered':
      return <BadgeCheck className="h-3.5 w-3.5" />
    case 'cancelled':
      return <XCircle className="h-3.5 w-3.5" />
    default:
      return <Package className="h-3.5 w-3.5" />
  }
}

function money(value: number) {
  if (!Number.isFinite(value)) return '৳0'

  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function customerName(order: Order) {
  return `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim() || 'কাস্টমার'
}

function itemCount(order: Order) {
  return order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.items?.length || 0
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const setCardBusy = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }))
  }

  const fetchOrders = useCallback(
    async (page = 1, options?: { silent?: boolean }) => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        if (!options?.silent) {
          if (orders.length === 0) setInitialLoading(true)
          else setListLoading(true)
        }

        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: ORDER_LIMIT.toString(),
          sortBy: 'createdAt',
          sortOrder: 'desc',
          includeStats: 'false',
        })

        if (debouncedSearch) params.set('search', debouncedSearch)
        if (statusFilter !== 'all') params.set('status', statusFilter)

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const data = (await res.json()) as OrdersResponse

        if (requestId !== requestIdRef.current) return

        const nextOrders = data.orders || []
        const pagination = data.pagination

        setOrders(nextOrders)
        setCurrentPage(pagination?.page || data.currentPage || page)
        setTotalPages(Math.max(1, pagination?.totalPages || data.totalPages || 1))
        setTotalOrders(pagination?.total || nextOrders.length)
      } catch (err: any) {
        if (err?.name === 'AbortError') return

        console.error('Error fetching orders:', err)
        setError('অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।')
      } finally {
        if (requestId === requestIdRef.current) {
          setInitialLoading(false)
          setListLoading(false)
        }
      }
    },
    [debouncedSearch, statusFilter, orders.length]
  )

  useEffect(() => {
    fetchOrders(1)
  }, [debouncedSearch, statusFilter, fetchOrders])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const isCarryBee = (order: Order) => {
    const provider = (order.deliveryProvider || '').toLowerCase()
    return provider.includes('carry') || provider === 'carrybee'
  }

  const hasConsignment = (order: Order) => Boolean(order.consignmentId)

  const updateLocalStatus = async (orderId: string, newStatus: Order['status']) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Failed to update order status')

    return data as { order?: Order }
  }

  const dispatchCarryBee = async (orderId: string, order: Order) => {
    const res = await fetch('/api/admin/orders/carry_bee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, order, item_weight: 500 }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'CarryBee dispatch failed')

    return data
  }

  const cancelCarryBee = async (orderId: string, reason = 'Cancelled by admin') => {
    const res = await fetch('/api/admin/orders/carry_bee', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, cancellation_reason: reason }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'CarryBee cancel failed')

    return data
  }

  const patchOrderInList = (orderId: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, ...patch } : order)))
  }

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    if (!order?._id || order.status === newStatus) return

    const previousStatus = order.status
    setCardBusy(order._id, true)
    patchOrderInList(order._id, { status: newStatus })

    try {
      if (newStatus === 'cancelled') {
        if (isCarryBee(order) && hasConsignment(order)) {
          await cancelCarryBee(order._id, 'Cancelled by admin (list)')
        }

        await updateLocalStatus(order._id, 'cancelled')
        await fetchOrders(currentPage, { silent: true })
        return
      }

      const updated = await updateLocalStatus(order._id, newStatus)
      const freshOrder = updated?.order || { ...order, status: newStatus }

      if (updated?.order) patchOrderInList(order._id, updated.order)

      if (newStatus === 'processing') {
        await dispatchCarryBee(order._id, freshOrder)
        await fetchOrders(currentPage, { silent: true })
      }
    } catch (err: any) {
      console.error('Status change failed:', err)
      patchOrderInList(order._id, { status: previousStatus })
      alert(err?.message || 'অর্ডার আপডেট করা যায়নি')
    } finally {
      setCardBusy(order._id, false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setStatusFilter('all')
  }

  const hasActiveFilters = Boolean(searchTerm.trim()) || statusFilter !== 'all'

  const summary = useMemo(() => {
    return {
      pending: orders.filter((order) => order.status === 'pending').length,
      processing: orders.filter((order) => order.status === 'processing').length,
    }
  }, [orders])

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 pb-10 md:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Search className="h-4 w-4" />
              অর্ডার খুঁজুন
            </label>
            <input
              type="text"
              placeholder="অর্ডার নম্বর, নাম অথবা ফোন লিখুন"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-600">
              <Filter className="h-4 w-4" />
              স্ট্যাটাস
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
            >
              <option value="all">সব অর্ডার</option>
              <option value="pending">নতুন</option>
              <option value="processing">প্রসেসিং</option>
              <option value="shipped">পাঠানো</option>
              <option value="delivered">ডেলিভারড</option>
              <option value="cancelled">বাতিল</option>
            </select>
          </div>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                ক্লিয়ার
              </button>
            )}
          </div>
        </div>

        {listLoading && orders.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            অর্ডার আপডেট হচ্ছে...
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error}
        </div>
      )}

      {initialLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-slate-600">অর্ডার লোড হচ্ছে...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h2 className="mt-4 text-lg font-black text-slate-900">কোনো অর্ডার পাওয়া যায়নি</h2>
          <p className="mt-1 text-sm text-slate-500">সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ফিল্টার ক্লিয়ার করুন
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">অর্ডার</th>
                  <th className="px-5 py-4">কাস্টমার</th>
                  <th className="px-5 py-4">আইটেম</th>
                  <th className="px-5 py-4">টাকা</th>
                  <th className="px-5 py-4">তারিখ</th>
                  <th className="px-5 py-4">স্ট্যাটাস</th>
                  <th className="px-5 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const rowBusy = Boolean(busy[order._id])
                  const carryTag = isCarryBee(order) && hasConsignment(order)

                  return (
                    <tr key={order._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 align-middle">
                        <div className="font-black text-slate-950">#{order.orderNumber}</div>
                        {carryTag && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            <Truck className="h-3 w-3" />
                            {order.consignmentId}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="font-bold text-slate-900">{customerName(order)}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {order.shippingAddress.phone || '—'}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle font-semibold text-slate-700">
                        {itemCount(order)} টি
                      </td>

                      <td className="px-5 py-4 align-middle font-black text-slate-950">
                        {money(order.total)}
                      </td>

                      <td className="px-5 py-4 align-middle text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusPill(order.status)}`}>
                            {statusIcon(order.status)}
                            {statusLabel[order.status]}
                          </span>

                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value as Order['status'])}
                            disabled={rowBusy}
                            className="block w-36 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                          >
                            <option value="pending">নতুন</option>
                            <option value="processing">প্রসেসিং</option>
                            <option value="shipped">পাঠানো</option>
                            <option value="delivered">ডেলিভারড</option>
                            <option value="cancelled">বাতিল</option>
                          </select>

                          {rowBusy && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              হচ্ছে...
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right align-middle">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          দেখুন
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {orders.map((order) => {
              const cardBusy = Boolean(busy[order._id])
              const carryTag = isCarryBee(order) && hasConsignment(order)

              return (
                <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">অর্ডার</p>
                      <h2 className="mt-1 truncate text-lg font-black text-slate-950">#{order.orderNumber}</h2>
                    </div>

                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusPill(order.status)}`}>
                      {statusIcon(order.status)}
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="font-bold">{customerName(order)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{order.shippingAddress.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">আইটেম</p>
                      <p className="mt-1 font-black text-slate-950">{itemCount(order)} টি</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">মোট টাকা</p>
                      <p className="mt-1 flex items-center gap-1 font-black text-slate-950">
                        <Banknote className="h-4 w-4" />
                        {money(order.total)}
                      </p>
                    </div>
                  </div>

                  {carryTag && (
                    <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{order.consignmentId}</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as Order['status'])}
                      disabled={cardBusy}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                    >
                      <option value="pending">নতুন</option>
                      <option value="processing">প্রসেসিং</option>
                      <option value="shipped">পাঠানো</option>
                      <option value="delivered">ডেলিভারড</option>
                      <option value="cancelled">বাতিল</option>
                    </select>

                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      দেখুন
                    </Link>
                  </div>

                  {cardBusy && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      আপডেট হচ্ছে...
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}

      {totalPages > 1 && !initialLoading && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-sm font-bold text-slate-600">
            পেজ {currentPage} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(currentPage - 1)}
              disabled={currentPage === 1 || listLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              আগের
            </button>

            <button
              onClick={() => fetchOrders(currentPage + 1)}
              disabled={currentPage === totalPages || listLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              পরের
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
