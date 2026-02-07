'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CreditCard,
  Filter,
  Home,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShieldAlert,
  ShoppingBag,
  Tag,
  Timer,
  Truck,
  Weight,
  XCircle,
  Ban,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sku?: string
  product: {
    id: string
    title: string
    slug: string
    sku: string
    images: Array<{
      url: string
      title: string
    }>
  }
}

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
  paymentMethod: { type: string }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  shipping: number
  tax: number
  total: number
  orderDate: string
  estimatedDelivery: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string

  consignmentId?: string | null
  deliveryProvider?: string | null
}

type Params = { id?: string }

export default function OrderDetailsPage() {
  const params = useParams() as Params

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [updating, setUpdating] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [orderId, setOrderId] = useState<string>('')

  // ✅ Item weight (gm) - default 500
  const [itemWeight, setItemWeight] = useState<number>(500)

  // Resolve orderId
  useEffect(() => {
    const id = params?.id
    if (id) setOrderId(id)
    else {
      setError('No order ID found')
      setLoading(false)
    }
  }, [params])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) fetchOrder(orderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const normalizedItemWeight = useMemo(() => {
    return typeof itemWeight === 'number' && itemWeight > 0 ? itemWeight : 500
  }, [itemWeight])

  const statusBadge = (status: string) => {
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

  const paymentBadge = (status: string) => {
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

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Timer className="h-4 w-4" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <BadgeCheck className="h-4 w-4" />
      case 'cancelled':
        return <ShieldAlert className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const isCarryBeeDispatched = useMemo(() => {
    const provider = (order?.deliveryProvider || '').toLowerCase()
    return (provider.includes('carry') || provider === 'carrybee') && !!order?.consignmentId
  }, [order?.deliveryProvider, order?.consignmentId])

  const canCancel =
    !!order &&
    order.status !== 'cancelled' &&
    (isCarryBeeDispatched || true) // allow cancel to set local cancelled even if not dispatched

  const hardBusy = updating || dispatching || cancelling

  const dispatchToCarryBee = async (freshOrder: Order) => {
    if (!orderId) return

    setDispatching(true)
    try {
      const dispatchRes = await fetch('/api/admin/orders/carry_bee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          order: freshOrder,
          item_weight: normalizedItemWeight,
        }),
      })

      if (!dispatchRes.ok) {
        const err = await dispatchRes.json().catch(() => ({}))
        console.error('Dispatch failed:', err)
        alert(err?.error?.message || err?.message || 'Dispatch failed')
        return
      }

      await dispatchRes.json().catch(() => ({}))
      alert('Order dispatched to CarryBee successfully.')
      await fetchOrder(orderId)
    } finally {
      setDispatching(false)
    }
  }

  // ✅ Cancel CarryBee (if dispatched) + set local status cancelled
  const cancelOrder = async (reasonOverride?: string) => {
    if (!orderId) return

    const reason = (reasonOverride ?? cancelReason).trim() || 'Cancelled by admin'

    setCancelling(true)
    try {
      // If dispatched to CarryBee, cancel there first.
      if (isCarryBeeDispatched) {
        const res = await fetch('/api/admin/orders/carry_bee', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, cancellation_reason: reason }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          console.error('CarryBee cancel failed:', data)
          alert(data?.error?.message || data?.message || 'CarryBee cancel failed')
          return
        }

        // Your DELETE handler likely sets local status = cancelled.
        // Still refresh to reflect DB.
        alert(data?.message || 'Order cancelled successfully.')
      } else {
        // Not dispatched → just cancel locally
        await updateOrderStatusOnly('cancelled')
        alert('Order cancelled locally.')
      }

      setShowCancel(false)
      setCancelReason('')
      await fetchOrder(orderId)
    } finally {
      setCancelling(false)
    }
  }

  // ✅ Local-only status update helper (no dispatch / no carrybee cancel)
  const updateOrderStatusOnly = async (newStatus: Order['status']) => {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!response.ok) throw new Error('Failed to update order status')
    const data = await response.json()
    setOrder(data.order)
    return data.order as Order
  }

  // ✅ Main status update handler
  // - if status -> processing: update local then dispatch
  // - if status -> cancelled: open cancel modal (so admin can add reason)
  // - else: update local only
  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!orderId || !order) return

    try {
      setUpdating(true)

      if (newStatus === 'cancelled') {
        // show modal to capture reason; cancel action will also update local status
        setShowCancel(true)
        return
      }

      const updatedOrder = await updateOrderStatusOnly(newStatus)

      if (newStatus === 'processing') {
        await dispatchToCarryBee(updatedOrder)
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (newPaymentStatus: Order['paymentStatus']) => {
    if (!orderId) return
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update payment status')

      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Error updating payment status:', err)
      alert('Failed to update payment status')
    } finally {
      setUpdating(false)
    }
  }

  // If admin selects "cancelled" in modal confirm → do both cancel + local status.
  const confirmCancelFromModal = async () => {
    // Ensure local status becomes cancelled even if carrybee cancel succeeds but local not updated
    // If your DELETE handler already updates local status, this is just extra safety.
    await cancelOrder(cancelReason)

    // If the server didn't update local status inside DELETE, ensure it here:
    try {
      if (order?.status !== 'cancelled') {
        await updateOrderStatusOnly('cancelled')
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <div className="font-medium">Loading order details...</div>
            {orderId && <div className="text-sm text-slate-500 mt-1">Order ID: {orderId}</div>}
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-xl bg-rose-50 ring-1 ring-rose-200 p-4 text-rose-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 mt-0.5" />
            <div>
              <div className="font-semibold">Unable to load order</div>
              <div className="text-sm">{error || 'Order not found'}</div>
              <Link
                href="/admin/orders"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Sticky Quick Actions */}
      <div className="sticky top-3 z-40">
        <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm ring-1 ring-slate-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <div className="text-lg font-bold text-slate-900 truncate">
                  #{order.orderNumber}
                </div>

                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full ${statusBadge(
                    order.status
                  )}`}
                >
                  {statusIcon(order.status)}
                  {order.status}
                </span>

                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full ${paymentBadge(
                    order.paymentStatus
                  )}`}
                >
                  <CreditCard className="h-4 w-4" />
                  {order.paymentStatus}
                </span>

                {order.deliveryProvider && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    <Truck className="h-4 w-4" />
                    {order.deliveryProvider}
                  </span>
                )}

                {order.consignmentId && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    <Tag className="h-4 w-4" />
                    {order.consignmentId}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              {/* Weight */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Weight className="h-4 w-4 text-slate-600" />
                <input
                  type="number"
                  min={1}
                  value={itemWeight}
                  onChange={(e) => setItemWeight(Math.max(1, Number(e.target.value || 500)))}
                  className="w-20 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  title="Item weight (gm)"
                />
                <span className="text-xs text-slate-500">gm</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Truck className="h-4 w-4 text-slate-600" />
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                  disabled={hardBusy}
                  className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  title="Update order status"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing (Dispatch)</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Cancel CarryBee)</option>
                </select>
              </div>

              {/* Payment */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <CreditCard className="h-4 w-4 text-slate-600" />
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value as Order['paymentStatus'])}
                  disabled={hardBusy}
                  className="bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  title="Update payment status"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Cancel */}
              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  disabled={hardBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  title="Cancel order (and CarryBee consignment if dispatched)"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Order
                </button>
              )}

              {(updating || dispatching || cancelling) && (
                <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {cancelling ? 'Cancelling…' : dispatching ? 'Dispatching…' : 'Updating…'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Tip: Setting status to <span className="font-semibold">Processing</span> dispatches to CarryBee. Setting to{' '}
            <span className="font-semibold">Cancelled</span> cancels CarryBee (if dispatched) and updates local status.
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !cancelling && setShowCancel(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
                    <Ban className="h-5 w-5 text-rose-600" />
                    Cancel Order
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    If this order is dispatched to CarryBee, it will cancel the consignment using your stored consignment ID.
                  </p>
                </div>
                <button
                  onClick={() => setShowCancel(false)}
                  disabled={cancelling}
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-60"
                  aria-label="Close"
                >
                  <XCircle className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-semibold">Double-check before cancelling</div>
                    <div className="text-sm mt-1">
                      Provider:{' '}
                      <span className="font-semibold">{order.deliveryProvider || 'local'}</span>
                    </div>
                    <div className="text-sm mt-1">
                      Consignment:{' '}
                      <span className="font-semibold">{order.consignmentId || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cancellation reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Customer changed mind / Incorrect address / Out of stock"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <p className="mt-2 text-xs text-slate-500">
                  If empty, we’ll send <span className="font-semibold">“Cancelled by admin”</span>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCancel(false)}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Back
                </button>

                <button
                  onClick={confirmCancelFromModal}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      Confirm Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Items
            </h2>

            <div className="mt-4 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden ring-1 ring-slate-200">
                    {item.product?.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                          {(item?.sku || item?.product?.sku) && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                              <Tag className="h-3.5 w-3.5" />
                              SKU: {item.sku || item.product.sku}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                            <Package className="h-3.5 w-3.5" />
                            Qty: {item.quantity}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">
                            <Banknote className="h-3.5 w-3.5" />
                            ৳{item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-slate-900">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Order Timeline
            </h2>

            <div className="mt-4 space-y-4">
              <TimelineRow
                color="bg-emerald-500"
                title="Order Placed"
                subtitle={new Date(order.orderDate).toLocaleString()}
              />
              {order.status !== 'pending' && (
                <TimelineRow
                  color="bg-blue-500"
                  title="Status Updated"
                  subtitle={new Date(order.updatedAt).toLocaleString()}
                />
              )}
              <TimelineRow
                color="bg-slate-300"
                title="Estimated Delivery"
                subtitle={new Date(order.estimatedDelivery).toLocaleDateString()}
              />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Summary
            </h2>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <Row label="Subtotal" value={`৳${order.subtotal.toFixed(2)}`} />
              <Row label="Shipping" value={`৳${order.shipping.toFixed(2)}`} />
              <Row label="Tax" value={`৳${order.tax.toFixed(2)}`} />
              <div className="my-3 h-px bg-slate-200" />
              <Row
                label={<span className="font-semibold text-slate-900">Total</span>}
                value={<span className="font-bold text-slate-900">৳{order.total.toFixed(2)}</span>}
              />
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Customer
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-slate-500" />
                <span className="font-semibold">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{order.shippingAddress.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              Shipping Address
            </h2>

            <div className="mt-4 text-sm text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                <div>
                  <div>{order.shippingAddress.address}</div>
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </h2>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span className="font-semibold">Method:</span>
                <span>{order.paymentMethod?.type || 'Not specified'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="font-semibold">Status:</span>
                <span
                  className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full ${paymentBadge(
                    order.paymentStatus
                  )}`}
                >
                  <CreditCard className="h-4 w-4" />
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-slate-600">{label}</div>
      <div className="text-slate-900">{value}</div>
    </div>
  )
}

function TimelineRow({
  color,
  title,
  subtitle,
}: {
  color: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-2 h-2.5 w-2.5 rounded-full ${color}`} />
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
  )
}
