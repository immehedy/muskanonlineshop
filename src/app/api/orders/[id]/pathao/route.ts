
import { NextRequest, NextResponse } from 'next/server'
import PathaoAPI, { PathaoOrderData } from '@/lib/pathao'
import { dbConnect } from '@/lib/database'
import Order from '@/lib/models/Order'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    console.log("hello")
  try {
    await dbConnect()

    const orderId = params.id
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    if (order.pathaoOrder?.consignment_id) {
      return NextResponse.json({ message: 'Pathao order already exists' }, { status: 400 })
    }

    // Step 1: Get access token
    const tokenResponse = await PathaoAPI.getAccessToken()
    const accessToken = tokenResponse.access_token

    // Step 2: Get city ID from city name
    const cityId = await PathaoAPI.getCityIdByName(accessToken, order.shippingAddress.city)
    if (!cityId) {
      return NextResponse.json({ message: 'Unsupported delivery city' }, { status: 400 })
    }

    // Step 3: Get zone ID from city
    const zoneId = await PathaoAPI.getDefaultZoneForCity(accessToken, cityId)
    if (!zoneId) {
      return NextResponse.json({ message: 'No delivery zone found for this city' }, { status: 400 })
    }

    // Step 4: Build Pathao order payload
    const itemDescription = order.items.map((item: any) =>
      `${item.name || item.title || item.productName} (${item.quantity})`
    ).join(', ')

const pathaoOrderData: PathaoOrderData = {
  store_id: process.env.PATHAO_STORE_ID as string, // Cast to string (you may also validate presence)
  merchant_order_id: order.orderNumber,
  sender_name: process.env.PATHAO_SENDER_NAME || 'Thread Park BD',
  sender_phone: process.env.PATHAO_SENDER_PHONE || '01300000000',
  recipient_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
  recipient_phone: String(order.shippingAddress.phone),
  recipient_address: String(order.shippingAddress.address),
  recipient_city: cityId, // Must be number, already validated
  recipient_zone: zoneId, // Must be number, already validated
  delivery_type: 48,
  item_type: 2,
  special_instruction: `Order #${order.orderNumber}`,
  item_quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
  item_weight: 0.5,
  amount_to_collect: order.paymentMethod.type === 'cod' ? order.total : 0,
  item_description: order.items.map((item: any) => `${item.name || item.title || item.productName} (${item.quantity})`).join(', ')
}


    // Step 5: Call Pathao API to create order
    const pathaoResponse = await PathaoAPI.createOrder(accessToken, pathaoOrderData)

    if (pathaoResponse.success) {
      const now = new Date().toISOString()
      order.pathaoOrder = {
        consignment_id: pathaoResponse.data.consignment_id,
        order_status: pathaoResponse.data.order_status || 'pending_pickup',
        delivery_fee: pathaoResponse.data.delivery_fee || 0,
        created_at: now,
        updated_at: now
      }

      await order.save()

      return NextResponse.json({
        success: true,
        message: 'Pathao order created successfully',
        pathaoOrder: order.pathaoOrder
      })
    } else {
      throw new Error(pathaoResponse.message || 'Failed to create order in Pathao')
    }

  } catch (error) {
    console.error('Error creating Pathao order:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create Pathao order'
    }, { status: 500 })
  }
}


// /api/admin/orders/[id]/pathao/status/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const orderId = params.id
    
    // Find the order
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // Check if Pathao order exists
    if (!order.pathaoOrder?.consignment_id) {
      return NextResponse.json(
        { message: 'No Pathao order found for this order' },
        { status: 400 }
      )
    }

    // Get access token from Pathao
    const tokenResponse = await PathaoAPI.getAccessToken()
    const accessToken = tokenResponse.access_token

    // Get order status from Pathao
    const pathaoResponse = await PathaoAPI.getOrderInfo(
      accessToken, 
      order.pathaoOrder.consignment_id
    )

    if (pathaoResponse.success) {
      // Update order with latest Pathao information
      const updatedPathaoOrder = {
        ...order.pathaoOrder,
        order_status: pathaoResponse.data.order_status,
        delivery_fee: pathaoResponse.data.delivery_fee || order.pathaoOrder.delivery_fee,
        updated_at: new Date().toISOString()
      }

      order.pathaoOrder = updatedPathaoOrder

      // Update main order status based on Pathao status
      if (pathaoResponse.data.order_status === 'delivered' && order.status !== 'delivered') {
        order.status = 'delivered'
      } else if (pathaoResponse.data.order_status === 'picked_up' && order.status === 'processing') {
        order.status = 'shipped'
      }

      await order.save()

      return NextResponse.json({
        success: true,
        message: 'Pathao status updated successfully',
        pathaoOrder: updatedPathaoOrder
      })
    } else {
      throw new Error(pathaoResponse.message || 'Failed to get Pathao order status')
    }

  } catch (error) {
    console.error('Error getting Pathao order status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get Pathao order status' 
      },
      { status: 500 }
    )
  }
}