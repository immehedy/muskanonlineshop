// /api/admin/orders/route.ts - Orders List API
import { NextRequest, NextResponse } from 'next/server';
import Order from '@/lib/models/Order';
import { dbConnect } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'Admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}