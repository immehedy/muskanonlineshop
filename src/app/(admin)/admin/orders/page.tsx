'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Search,
  Filter,
  CalendarDays,
  User,
  Mail,
  Phone,
  Package,
  BadgeCheck,
  Truck,
  Timer,
  XCircle,
  CreditCard,
  Banknote,
  ExternalLink,
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [busy, setBusy] = useState<Record<string, boolean>>({})

  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  const setCardBusy = (id: string, v: boolean) => setBusy((p) => ({ ...p, [id]: v }))

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const res = await fetch(`/api/admin/orders?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setCurrentPage(data.currentPage)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter])

  const isCarryBee = (order: Order) => {
    const p = (order.deliveryProvider || '').toLowerCase()
    return p.includes('carry') || p === 'carrybee'
  }
  const hasConsignment = (order: Order) => !!order.consignmentId

  const updateLocalStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Failed to update order status')
    return data // { order: ... }
  }

  const dispatchCarryBee = async (orderId: string, order: Order) => {
    const res = await fetch('/api/admin/orders/carry_bee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        order,
        item_weight: 500, // default from list page
      }),
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

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    if (!order?._id) return
    if (order.status === newStatus) return

    setCardBusy(order._id, true)
    try {
      // Cancelled: cancel CarryBee first if it was dispatched
      if (newStatus === 'cancelled') {
        if (isCarryBee(order) && hasConsignment(order)) {
          await cancelCarryBee(order._id, 'Cancelled by admin (list)')
        }
        await updateLocalStatus(order._id, 'cancelled')
        await fetchOrders(currentPage)
        return
      }

      // Local update first
      const updated = await updateLocalStatus(order._id, newStatus)
      const freshOrder: Order = updated?.order || order

      // Processing: dispatch CarryBee
      if (newStatus === 'processing') {
        await dispatchCarryBee(order._id, freshOrder)
      }

      await fetchOrders(currentPage)
    } catch (err: any) {
      console.error('Status change failed:', err)
      alert(err?.message || 'Failed to update order')
      await fetchOrders(currentPage)
    } finally {
      setCardBusy(order._id, false)
    }
  }

  const statusPill = (status: Order['status']) => {
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

  const paymentPill = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      case 'failed':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      case 'refunded':
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
    }
  }

  const statusIcon = (status: Order['status']) => {
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

  const shortOrder = (orderNumber: string) => {
    if (!orderNumber) return '—'
    if (orderNumber.length <= 14) return orderNumber
    return `${orderNumber.slice(0, 5)}…${orderNumber.slice(-5)}`
  }

  const pageInfo = useMemo(() => `Page ${currentPage} / ${totalPages}`, [currentPage, totalPages])

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Compact header + filters */}
      <div className="sticky top-2 z-40">
        <div className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-slate-200 shadow-sm p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">Orders</h1>
              <div className="text-xs text-slate-500">{pageInfo}</div>
            </div>

            <button
              onClick={() => fetchOrders(1)}
              disabled={loading}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                <Search className="h-4 w-4" />
                Search
              </div>
              <input
                type="text"
                placeholder="Order #, email, name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                <Filter className="h-4 w-4" />
                Status
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="hidden md:flex items-end">
              <div className="w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2 text-xs text-slate-600">
                Tip: Processing dispatches CarryBee • Cancelled cancels CarryBee (if dispatched)
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-slate-600 text-sm">
          Loading orders…
        </div>
      ) : null}

      {/* ✅ Responsive Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {orders.map((order) => {
          const cardBusy = !!busy[order._id]
          const carryTag = isCarryBee(order) && hasConsignment(order)

          return (
            <div
              key={order._id}
              className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-3"
            >
              {/* Top: order + quick action */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {shortOrder(order.orderNumber)}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusPill(order.status)}`}>
                      {statusIcon(order.status)}
                      {order.status}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${paymentPill(order.paymentStatus)}`}>
                      <CreditCard className="h-3.5 w-3.5" />
                      {order.paymentStatus}
                    </span>

                    {carryTag && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                        <Truck className="h-3.5 w-3.5" />
                        {order.consignmentId}
                      </span>
                    )}
                  </div>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value as Order['status'])}
                  disabled={cardBusy}
                  className="shrink-0 rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60"
                  title="Quick status"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer */}
              <div className="mt-3 space-y-1 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{order.shippingAddress.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate">{order.shippingAddress.phone}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-2">
                  <div className="text-[11px] text-slate-500">Items</div>
                  <div className="font-semibold text-slate-900">{order.items.length}</div>
                </div>

                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-2">
                  <div className="text-[11px] text-slate-500">Total</div>
                  <div className="font-bold text-slate-900 inline-flex items-center gap-1">
                    <Banknote className="h-3.5 w-3.5" />
                    ৳{order.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Date + footer actions */}
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>

                <Link
                  href={`/admin/orders/${order._id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Link>
              </div>

              {cardBusy && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Updating…
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!loading && orders.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">No orders found</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => fetchOrders(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => fetchOrders(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
