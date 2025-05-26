import { NextRequest, NextResponse } from 'next/server';
import { CartItem, PaymentMethod } from '@/types/checkout';
import { OrderDatabase } from '@/lib/order';

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