'use client';

import { useState, useEffect } from 'react';

// Updated interface to match your actual data structure
interface IOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

interface IShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  _id: string;
}

interface IPaymentMethod {
  type: string;
  expiryDate: string;
  cardholderName: string;
  last4: string;
  _id: string;
}

interface IOrder {
  _id: string;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: IPaymentMethod;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const fetchOrders = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="email"
          placeholder="Enter your email to view orders"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2"
        />
        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Search Orders
        </button>
      </div>

      {loading && <div className="text-center">Loading orders...</div>}

      {!loading && orders.length === 0 && email && (
        <div className="text-center text-gray-600">
          No orders found for this email address.
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order {order.orderNumber}</h3>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Order ID: {order._id}
                </p>
              </div>
              <div className="text-right">
                <div className="flex flex-col gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <p className="text-lg font-bold mt-2">${order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">(Qty: {item.quantity})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      <span className="text-sm text-gray-500 block">${item.price} each</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Shipping Address:</h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1">
                      <span className="text-gray-500">Phone:</span> {order.shippingAddress.phone}
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span> {order.shippingAddress.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Payment Method:</h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{order.paymentMethod.cardholderName}</p>
                    <p>Card ending in {order.paymentMethod.last4}</p>
                    <p>Expires: {order.paymentMethod.expiryDate}</p>
                    <p>Type: {order.paymentMethod.type.charAt(0).toUpperCase() + order.paymentMethod.type.slice(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">Order Summary:</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}