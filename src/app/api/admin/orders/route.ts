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
    const requiredAddressFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get all orders with pagination and filters
    const orders = await OrderDatabase.getAllOrders({
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder
    });

    // Get order statistics
    const stats = await OrderDatabase.getOrderStats();

    return NextResponse.json({
      orders: orders.data,
      pagination: {
        page,
        limit,
        total: orders.total,
        totalPages: Math.ceil(orders.total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Admin orders retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
