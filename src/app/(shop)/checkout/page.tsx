'use client';

import { useState, useEffect } from 'react';
import { CartManager } from '@/lib/cart';
import { CartItem, OrderResponse } from '@/types/checkout';
import { EmptyCart } from '@/components/checkout/EmptyCart';
import { OrderSummary } from '@/components/checkout/Summary';
import { ReviewOrder } from '@/components/checkout/ReviewOrder';
import PaymentForm from '@/components/checkout/PaymentForm';
import ShippingForm from '@/components/checkout/ShippingForm';
import StepIndicator from '@/components/checkout/StepIndicator';
import api from '@/lib/api';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

interface PaymentMethod {
  type: string;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh'
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'cod'
  });

  useEffect(() => {
    const items = CartManager.getCart();
    setCartItems(items);
  }, []);

  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product?.fields?.discountedPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  const shipping = (shippingAddress.city?.toLowerCase().includes('dhaka')) ? 80 : 130;
  const tax = 0;
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

      const result = await api.post<OrderResponse>('/api/orders', orderData);
      if (result.success) {
        // 🔁 Generate unique event ID for deduplication
        const eventId = `purchase_${Date.now()}`;

        // 🎯 Send to Facebook Pixel (client-side)
        window.fbq('track', 'Purchase', {
          value: total,
          currency: 'BDT',
          eventID: eventId
        });

        // 🔁 Send to Facebook Conversion API (server-side)
        await fetch('/api/fb-conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: 'Purchase',
            event_id: eventId,
            url: window.location.href,
          }),
        });

        CartManager.clearCart();
        window.location.reload();
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
        shippingAddress.phone &&
        shippingAddress.address &&
        shippingAddress.city
      );
    }
    if (stepNum === 2) {
      return paymentMethod.type;
    }
    return true;
  };

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Steps */}
        <div>
          <StepIndicator step={step} />
          {step === 1 && (
            <ShippingForm
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              onNext={() => setStep(2)}
              isValid={validateStep(1)}
            />
          )}
          {step === 2 && (
            <PaymentForm
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              isValid={validateStep(2)}
            />
          )}
          {step === 3 && (
            <ReviewOrder
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              onBack={() => setStep(2)}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            />
          )}
        </div>
        {/* Right: Order Summary */}
        <OrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  );
}
