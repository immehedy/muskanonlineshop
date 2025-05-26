import { NextRequest, NextResponse } from 'next/server';
import { CartItem, PaymentMethod } from '@/types/checkout';
import { OrderDatabase } from '@/lib/order';

export async function POST(request: NextRequest) {
  try {
    const { items, shippingAddress, paymentMethod } = await request.json();

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Shipping address and payment method are required' 
      }, { status: 400 });
    }

    // Validate shipping address
    const requiredAddressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Process payment (mock implementation - replace with real payment processor)
    const paymentResult = await processPayment(paymentMethod, items);
    
    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: 'Payment failed: ' + paymentResult.error 
      }, { status: 400 });
    }

    // Create order in database
    const order = await OrderDatabase.createOrder(items, shippingAddress, paymentMethod);

    // Update payment status
    await OrderDatabase.updatePaymentStatus(order.id.toString(), 'paid');

    // In a real app, you would also:
    // 1. Send confirmation email
    // 2. Update inventory in Contentful
    // 3. Trigger fulfillment process
    // 4. Log analytics events

    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');

    if (orderId) {
      const order = await OrderDatabase.getOrder(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (orderNumber) {
      const order = await OrderDatabase.getOrderByNumber(orderNumber);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (email) {
      const orders = await OrderDatabase.getOrdersByEmail(email);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });

  } catch (error) {
    console.error('Order retrieval error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Mock payment processing function
async function processPayment(paymentMethod: PaymentMethod, items: CartItem[]) {
  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => {
      // Simulate payment processing
      if (paymentMethod.type === 'card' && paymentMethod.cardNumber?.startsWith('4000')) {
        resolve({ success: false, error: 'Card declined' });
      } else {
        resolve({ success: true });
      }
    }, 1000);
  });
}