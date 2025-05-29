// app/admin/orders/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, CreditCard, MapPin, Clock, Truck } from 'lucide-react';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  orderDate: string;
  updatedAt: string;
  estimatedDelivery: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: {
    type: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku?: string;
    price: number;
    quantity: number;
  }>;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
        setNewStatus(data.order.status);
      } else {
        console.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!order || newStatus === order.status) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          statusNotes: statusNotes || undefined,
        }),
      });

      if (response.ok) {
        await fetchOrder(); // Refresh order data
        setStatusNotes('');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                statusColors[order.status as keyof typeof statusColors]
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]
              }`}>
                Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item?.sku}</p>
                      <p className="text-sm text-gray-500">Product ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shipping)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>
            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                  </div>
                </div>
                {order.status !== 'pending' && (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                        ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Processing</p>
                      <p className="text-sm text-gray-500">Status updated to processing</p>
                    </div>
                  </div>
                )}
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      order.status === 'shipped' || order.status === 'delivered' ? 'bg-purple-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Shipped</p>
                      <p className="text-sm text-gray-500">Package is on its way</p>
                    </div>
                  </div>
                )}
                {order.status === 'delivered' && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Delivered</p>
                      <p className="text-sm text-gray-500">Package delivered successfully</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Customer & Shipping Information */}
<div className="bg-white rounded-lg shadow p-6">
  <div className="mb-4">
    <h3 className="font-semibold text-gray-900 mb-1">Customer</h3>
    <div className="text-sm text-gray-700">
      <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
      <div>{order.shippingAddress.email}</div>
      <div>{order.shippingAddress.phone}</div>
    </div>
  </div>
  
  <div className="mb-4">
    <h3 className="font-semibold text-gray-900 mb-1">Shipping Address</h3>
    <div className="text-sm text-gray-700">
      <div>{order.shippingAddress.address}</div>
      <div>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</div>
      <div>{order.shippingAddress.country}</div>
    </div>
  </div>
  
  <div>
    <h3 className="font-semibold text-gray-900 mb-1">Payment Method</h3>
    <div className="text-sm text-gray-700">
      {order.paymentMethod.type.charAt(0).toUpperCase() + order.paymentMethod.type.slice(1)}
    </div>
  </div>
</div>

            {/* Status Update */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Notes (Optional)
                  </label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this status update..."
                  />
                </div>
                <button
                  onClick={updateOrderStatus}
                  disabled={updating || newStatus === order.status}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
