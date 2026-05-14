import { NextRequest, NextResponse } from 'next/server'
import { OrderDatabase } from '@/lib/order'

export const runtime = 'nodejs'

function formatOrderDateTime(value?: string | Date) {
  const date = value ? new Date(value) : new Date()

  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(date)
}

function itemsText(items: any[]) {
  if (!items?.length) return 'কোনো আইটেম নেই'

  return items
    .map((item, index) => {
      const quantity = item.quantity || 1
      const name = item.name || item.title || item.productName || 'পণ্য'
      const price = item.price ? ` - ৳${item.price}` : ''

      return `${index + 1}) ${name}
   পরিমাণ: ${quantity}${price}`
    })
    .join('\n\n')
}

async function sendOrderNotification(
  order: any,
  shippingAddress: any,
  fallbackItems: any[] = []
) {
  try {
    const orderItems = itemsText(order.items || fallbackItems)
    const orderDateTime = formatOrderDateTime(order.createdAt)

    const message = `
      🛍️ মুসকান অনলাইন শপ বিডি
      ━━━━━━━━━━━━━━━━
      ✅ নতুন অর্ডার এসেছে
      🧾 অর্ডার নম্বর
      ${order.orderNumber}
      🕒 অর্ডারের সময়
      ${orderDateTime}

      👤 কাস্টমার
      ${shippingAddress.firstName} ${shippingAddress.lastName || ''}
      📞 ফোন
      ${shippingAddress.phone}
      📍 ঠিকানা
      ${shippingAddress.address}, ${shippingAddress.city}

      📦 অর্ডার আইটেম
      ${orderItems}

      💰 মোট টাকা
      ৳${order.total}
      ━━━━━━━━━━━━━━━━
      অর্ডারটি দ্রুত চেক করুন।
    `.trim()

    await fetch('https://ntfy.sh/muskan-online-shop-bd', {
      method: 'POST',
      headers: {
        'X-Priority': 'high',
        'X-Tags': 'shopping_cart',
      },
      body: message,
    })
  } catch (error) {
    console.error('ntfy notification failed:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items, shippingAddress, paymentMethod } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        {
          error: 'Shipping address and payment method are required',
        },
        { status: 400 }
      )
    }

    const requiredAddressFields = [
      'firstName',
      'lastName',
      'phone',
      'address',
      'city',
    ]

    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    const order = await OrderDatabase.createOrder(
      items,
      shippingAddress,
      paymentMethod
    )

    sendOrderNotification(order, shippingAddress, items)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    })
  } catch (error) {
    console.error('Order creation error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}