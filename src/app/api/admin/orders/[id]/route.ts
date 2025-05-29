import { NextRequest, NextResponse } from 'next/server';
import { OrderDatabase } from '@/lib/order';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const order = await OrderDatabase.getOrder(params.id);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ order });
  
    } catch (error) {
      console.error('Order retrieval error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  
  export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const updates = await request.json();
      
      const order = await OrderDatabase.updateOrder(params.id, updates);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ order });
  
    } catch (error) {
      console.error('Order update error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }