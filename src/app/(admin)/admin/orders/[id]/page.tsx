'use client'

import { useState, useEffect, useMemo } from 'react'
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
  paymentMethod: {
    type: string
  }
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

  // optional fields if you store later:
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
      const response = await fetch(`/api/admin/orders/${id}`)
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

  // Fetch when orderId available
  useEffect(() => {
    if (orderId) fetchOrder(orderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

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

  const normalizedItemWeight = useMemo(() => {
    return typeof itemWeight === 'number' && itemWeight > 0 ? itemWeight : 500
  }, [itemWeight])

  const dispatchToCarryBee = async (freshOrder: Order) => {
    if (!orderId) return

    setDispatching(true)
    try {
      const dispatchRes = await fetch('/api/admin/orders/carry_bee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId, // ✅ required by your server route for DB update
          order: freshOrder, // ✅ required
          item_weight: normalizedItemWeight, // ✅ dynamic; defaults 500
        }),
      })

      if (!dispatchRes.ok) {
        const err = await dispatchRes.json().catch(() => ({}))
        console.error('Dispatch failed:', err)
        alert('Order status updated, but dispatch failed.')
        return
      }

      const payload = await dispatchRes.json().catch(() => ({}))
      console.log('Dispatch success:', payload)
      alert('Order dispatched to CarryBee successfully.')

      // Refresh order view (consignmentId may be saved)
      await fetchOrder(orderId)
    } finally {
      setDispatching(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order status')

      const data = await response.json()
      const updatedOrder: Order = data.order
      setOrder(updatedOrder)

      // 🔔 Dispatch to CarryBee only when status is "processing"
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

  const updatePaymentStatus = async (newPaymentStatus: string) => {
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
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="mt-2">
            <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
            <p className="text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Order #{order.orderNumber}
              </span>
            </p>

            {(order.deliveryProvider || order.consignmentId) && (
              <div className="mt-2 flex flex-wrap gap-2">
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
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items & Timeline */}
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

        {/* Right: Summary & Actions */}
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

          {/* Shipping Address */}
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

          {/* Actions */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Actions
            </h2>

            {/* Item weight (used for CarryBee dispatch) */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Item Weight (gm)
                </span>
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={itemWeight}
                  onChange={(e) => setItemWeight(Math.max(1, Number(e.target.value || 500)))}
                  className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <span className="text-sm text-slate-500">Default: 500gm</span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                This value is sent to CarryBee when you change status to{' '}
                <span className="font-semibold">processing</span>.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Update Order Status
                  </span>
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating || dispatching}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing (Dispatch to CarryBee)</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {(updating || dispatching) && (
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {dispatching ? 'Dispatching to CarryBee…' : 'Updating…'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Update Payment Status
                  </span>
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={updating || dispatching}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
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
