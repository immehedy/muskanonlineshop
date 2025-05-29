import { ShippingAddress } from '@/types/checkout';
import { NextRequest, NextResponse } from 'next/server';
import { OrderDatabase } from '@/lib/order';

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
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const includeCharts = searchParams.get('includeCharts') === 'true';

    // Fetch basic statistics
    const [
      totalProducts,
      totalOrders,
      monthlyRevenue,
      totalRevenue,
    ] = await Promise.all([
      getTotalOrders(parseInt(timeRange)),
      getTotalRevenue(parseInt(timeRange)),
      getOrdersByStatus(parseInt(timeRange)),
      getMonthlyRevenue(parseInt(timeRange)),
      includeCharts ? getMonthlyRevenue(parseInt(timeRange)) : getMonthlyRevenue(parseInt(timeRange))
    ]);

    const dashboardData: DashboardStats = {
      totalProducts,
      totalOrders,
      // monthlyRevenue,
      // totalRevenue,
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard data retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getTotalOrders(days: number): Promise<number> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await OrderDatabase.getOrderCount({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching order count:', error);
    return 0;
  }
}

async function getTotalRevenue(days: number): Promise<number> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orders = await OrderDatabase.getOrdersInDateRange({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      status: ['completed', 'shipped', 'delivered'] // Only count completed orders
    });

    return orders.reduce((total, order) => total + (order.total || 0), 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
}

async function getOrdersByStatus(days: number): Promise<OrderStatusCount[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const statusCounts = await OrderDatabase.getOrderCountsByStatus({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    });

    return statusCounts.map(item => ({
      status: item.status,
      count: item.count
    }));
  } catch (error) {
    console.error('Error fetching order status counts:', error);
    return [];
  }
}

async function getMonthlyRevenue(days: number): Promise<MonthlyRevenue[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    
    // Convert days to months for better monthly data
    const months = Math.ceil(days / 30);
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = await OrderDatabase.getMonthlyRevenue({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    return monthlyData.map(data => ({
      month: data.month,
      revenue: data.revenue,
      orderCount: data.orderCount
    }));
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    return [];
  }
}

// Additional endpoint for real-time updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'refresh_stats':
        // Trigger a cache refresh or real-time update
        const refreshedStats = await GET(request);
        return refreshedStats;
      
      case 'update_order_status':
        // Handle order status updates
        const { orderId, newStatus } = data;
        await OrderDatabase.updateOrderStatus(orderId, newStatus);
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Dashboard action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}