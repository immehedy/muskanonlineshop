'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
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
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  // Handle params resolution
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params)

        console.log("resolved", resolveParams);
        const id = resolvedParams?.id as string
        
        if (id) {
          console.log('Order ID resolved:', id)
          setOrderId(id)
        } else {
          setError('No order ID found')
          setLoading(false)
        }
      } catch (err) {
        console.error('Error resolving params:', err)
        setError('Failed to resolve order ID')
        setLoading(false)
      }
    }

    resolveParams()
  }, [params])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      console.log('Fetching order with ID:', id)
      const response = await fetch(`/api/admin/order/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Order data received:', data)
      setOrder(data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (newPaymentStatus: string) => {
    if (!orderId) return
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    } finally {
      setUpdating(false)
    }
  }

  // Fetch order when orderId is available
  useEffect(() => {
    if (orderId) {
      console.log('orderId changed, fetching order:', orderId)
      fetchOrder(orderId)
    }
  }, [orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">
          Loading order details... 
          {orderId && <span className="block text-sm mt-2">Order ID: {orderId}</span>}
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error || 'Order not found'}</div>
        <Link 
          href="/admin/orders"
          className="mt-2 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>
        <div className="flex space-x-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.product?.sku && (
                      <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ৳{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Order Placed</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.status !== 'pending' && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Status Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Estimated Delivery</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>৳{order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>৳{order.tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>৳{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p><strong>Email:</strong> {order.shippingAddress.email}</p>
              <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="text-sm">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            <p><strong>Method:</strong> {order.paymentMethod.type || 'Not specified'}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Order Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              {updating && (
                <div className="text-sm text-blue-600">Updating...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}