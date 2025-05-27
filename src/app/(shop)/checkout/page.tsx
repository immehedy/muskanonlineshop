'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartManager } from '@/lib/cart';
import { CartItem } from '@/types/checkout';


interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  type: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    // Get cart items from CartManager - assuming it returns items in your cart object format
    const items = CartManager.getCart();
    setCartItems(items);
  }, []);

  // Calculate totals using the actual price and discounted price
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product?.fields?.discountedPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          sku: item.product?.fields?.sku,
          price: item.product?.fields?.discountedPrice || item.price,
          originalPrice: item.product?.fields?.price,
          quantity: item.quantity,
          productId: item.product?.sys?.id
        })),
        shippingAddress,
        paymentMethod,
        summary: {
          subtotal,
          shipping,
          tax,
          total
        }
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart
        CartManager.clearCart();
        // Redirect to success page
        router.push(`/`);
      } else {
        alert('Order failed: ' + result.error);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('An error occurred while placing your order');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (stepNum: number) => {
    if (stepNum === 1) {
      return (
        shippingAddress.firstName &&
        shippingAddress.lastName &&
        shippingAddress.email &&
        shippingAddress.phone &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.state &&
        shippingAddress.zipCode
      );
    }
    if (stepNum === 2) {
      return (
        paymentMethod.cardholderName &&
        paymentMethod.cardNumber &&
        paymentMethod.expiryDate &&
        paymentMethod.cvv
      );
    }
    return true;
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          {/* Step Indicator */}
          <div className="flex mb-8">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepInfo.num ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}>
                    {stepInfo.num}
                  </div>
                  <span className="text-xs mt-1">{stepInfo.label}</span>
                </div>
                {index < 2 && <div className="w-16 h-1 bg-gray-300 mx-2 mt-2" />}
              </div>
            ))}
          </div>

          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                  className="border p-3 rounded col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  className="border p-3 rounded col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Address *"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  className="border p-3 rounded col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="ZIP Code *"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <select
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="BD">Bangladesh</option>
                </select>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!validateStep(1)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Cardholder Name *"
                  value={paymentMethod.cardholderName}
                  onChange={(e) => setPaymentMethod({...paymentMethod, cardholderName: e.target.value})}
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Card Number *"
                  value={paymentMethod.cardNumber}
                  onChange={(e) => {
                    // Format card number with spaces
                    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                    setPaymentMethod({...paymentMethod, cardNumber: formattedValue});
                  }}
                  maxLength={19}
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY *"
                    value={paymentMethod.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formattedValue = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
                      setPaymentMethod({...paymentMethod, expiryDate: formattedValue});
                    }}
                    maxLength={5}
                    className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="CVV *"
                    value={paymentMethod.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPaymentMethod({...paymentMethod, cvv: value});
                    }}
                    maxLength={4}
                    className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!validateStep(2)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Review</h2>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p>{shippingAddress.email}</p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <p>Card ending in **** {paymentMethod.cardNumber?.replace(/\s/g, '').slice(-4)}</p>
                <p>{paymentMethod.cardholderName}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => {
                const currentPrice = item.product?.fields?.discountedPrice || item.price;
                const originalPrice = item.product?.fields?.price;
                const hasDiscount = originalPrice && currentPrice < originalPrice;
                
                return (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-sm text-gray-600">SKU: {item.product?.fields?.sku}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {hasDiscount && (
                        <div className="text-sm">
                          <span className="line-through text-gray-500">৳{originalPrice}</span>
                          <span className="text-green-600 ml-2">৳{currentPrice}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{(currentPrice * item.quantity).toFixed(2)}</p>
                      {hasDiscount && (
                        <p className="text-xs text-green-600">
                          Save ৳{((originalPrice - currentPrice) * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">Free shipping on orders over $50!</p>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}