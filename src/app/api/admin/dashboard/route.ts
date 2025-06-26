import { OrderDatabase } from '@/lib/order';
import { NextRequest, NextResponse } from 'next/server';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  // monthlyRevenue: number,
  // totalRevenue: number,
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  ShippingAddress: {
    firstName: string,
    email: string
  }
  customerEmail: string;
  customerName?: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  minStockLevel: number;
  price: number;
  image?: string;
}

interface OrderStatusCount {
  status: string;
  count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orderCount: number;
}

export async function GET(request: NextRequest) {
  try {
    // You might want to add authentication here to ensure only admins can access this
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const stats = await OrderDatabase.getOrderStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard stats' 
      }, 
      { status: 500 }
    );
  }
}