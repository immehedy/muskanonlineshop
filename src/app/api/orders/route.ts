import { NextRequest, NextResponse } from 'next/server';
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
    const requiredAddressFields = ['firstName', 'lastName', 'phone', 'address', 'city'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    

    // Create order in database
    const order = await OrderDatabase.createOrder(items, shippingAddress, paymentMethod);

    // Update payment status
    // await OrderDatabase.updatePaymentStatus(order.id.toString(), 'paid');

    // In a real app, you would also
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

