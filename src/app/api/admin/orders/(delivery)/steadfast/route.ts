import { Order } from '@/types/checkout';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = `${process.env.STEADFAST_BASE_URL}/create_order`;

export async function POST(req: NextRequest) {
  try {
    // Accepts { order: Order }
    const bodyData = await req.json();
    const order: Order = bodyData.order;

    if (!order || !order.orderNumber || !order.shippingAddress || !order.items) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const headers = {
      'Api-Key': process.env.STEADFAST_API_KEY!,
      'Secret-Key': process.env.STEADFAST_SECRET_KEY!,
      'Content-Type': 'application/json',
    };

    const payload = {
      invoice: order.orderNumber,
      recipient_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      recipient_phone: order.shippingAddress.phone,
      alternative_phone: (order.shippingAddress as any).altPhone || '', // if you decide to include it in type later
      recipient_email: order.shippingAddress.email || '',
      recipient_address: `${order?.shippingAddress?.address} ${order?.shippingAddress?.city} ${order?.shippingAddress?.zipCode} ${order?.shippingAddress?.country}`,
      cod_amount: order.total,
      note: (order as any).note || '', // note not typed in Order, if not already in your type
      item_description: order.items
        .map((item) => item.name || item.title || 'Unknown Item')
        .join(', '),
      total_lot: order.items.length,
      delivery_type: 0, // 0 = home delivery
      entry_by: "Mehedy Hassan"
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Dispatch order error:', error);
    return NextResponse.json({ error: 'Failed to dispatch order' }, { status: 500 });
  }
}
