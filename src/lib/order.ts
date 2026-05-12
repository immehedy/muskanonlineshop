import Order, { IOrder } from './models/Order';
import { CartItem, ShippingAddress, PaymentMethod } from '@/types/checkout';
import { dbConnect } from './database';

export class OrderDatabase {
    static async createOrder(
        items: CartItem[],
        shippingAddress: ShippingAddress,
        paymentMethod: PaymentMethod
      ): Promise<IOrder> {
        await dbConnect();
      
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = this.calculateShipping(items, shippingAddress);
        const tax = 0;
        const total = subtotal + shipping + tax;
      
        // Sanitize payment method for security
        const sanitizedPaymentMethod = {
          type: paymentMethod?.type
        };
      
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
        const order = new Order({
          orderNumber,
          items: items.map(item => ({
            id: item.id,
            name: item.title, // Using 'name' field as required by schema
            price: item.price,
            quantity: item.quantity,
            sku: item.sku,
            product: {
              id: item.product?.sys?.id || item.id,
              title: item.product?.fields?.title || item.title,
              slug: item.product?.fields?.slug,
              sku: item.product?.fields?.sku,
              images: item.product?.fields?.images?.map(img => ({
                url: img.fields?.file?.url,
                title: img.fields?.title
              })) || []
            }
          })),
          shippingAddress: {
            firstName: shippingAddress?.firstName,
            lastName: shippingAddress?.lastName,
            email: shippingAddress?.email,
            phone: shippingAddress?.phone,
            address: shippingAddress?.address,
            city: shippingAddress.city,
            zipCode: shippingAddress?.zipCode,
            country: shippingAddress?.country
          },
          paymentMethod: sanitizedPaymentMethod,
          subtotal,
          shipping,
          tax,
          total,
          status: 'pending',
          paymentStatus: 'pending',
          orderDate: new Date(),
          estimatedDelivery: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days from now
        });
      
        return await order.save();
      }

  static async getOrder(orderId: string): Promise<IOrder | null> {
    await dbConnect();
    return await Order.findById(orderId);
  }

  static async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    await dbConnect();
    return await Order.findOne({ orderNumber });
  }

  static async getOrdersByEmail(email: string): Promise<IOrder[]> {
    await dbConnect();
    return await Order.find({ 'shippingAddress.email': email }).sort({ createdAt: -1 });
  }

  static async updateOrderStatus(orderId: string, status: IOrder['status']): Promise<IOrder | null> {
    await dbConnect();
    return await Order.findByIdAndUpdate(
      orderId, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
  }

  static async updatePaymentStatus(orderId: string, paymentStatus: IOrder['paymentStatus']): Promise<IOrder | null> {
    await dbConnect();
    return await Order.findByIdAndUpdate(
      orderId, 
      { paymentStatus, updatedAt: new Date() }, 
      { new: true }
    );
  }

  static calculateShipping(items: CartItem[], address: ShippingAddress): number {
    const city = address.city?.trim().toLowerCase();
    if (city === 'dhaka') {
      return 80;
    } else {
      return 130;
    }
  }
  

  static calculateTax(subtotal: number, address: ShippingAddress): number {
    const taxRates: { [key: string]: number } = {
      'CA': 0.0875, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
      'WA': 0.065,  // Washington
    };
    
    const taxRate = taxRates[address.city] || 0.06; // Default 6%
    return subtotal * taxRate;
  }

  static async getOrderStats() {
    await dbConnect();
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      processingOrders: 0
    };
  }

  static async getAllOrders(options: {
  page: number;
  limit: number;
  status?: string | null;
  search?: string | null;
  sortBy: string;
  sortOrder: string;
}) {
  const { page, limit, status, search, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  try {
    // Build filter query
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    return {
      data: orders,
      total
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to retrieve orders');
  }
}

static async updateOrder(orderId: string, updates: Partial<IOrder>) {
  try {
    await dbConnect();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        ...updates,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

static async getOrderCount(dateRange?: { startDate: string; endDate: string }): Promise<number> {
  await dbConnect();
  
  let filter: any = {};
  
  if (dateRange) {
    filter.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }
  
  return await Order.countDocuments(filter);
}

static async getOrdersInDateRange(params: {
  startDate: string;
  endDate: string;
  status?: string[];
}): Promise<IOrder[]> {
  await dbConnect();
  
  const filter: any = {
    createdAt: {
      $gte: new Date(params.startDate),
      $lte: new Date(params.endDate)
    }
  };
  
  if (params.status && params.status.length > 0) {
    filter.status = { $in: params.status };
  }
  
  return await Order.find(filter);
}

static async getRecentOrders(limit: number): Promise<IOrder[]> {
  await dbConnect();
  
  return await Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit);
}

static async getOrderCountsByStatus(dateRange?: { startDate: string; endDate: string }): Promise<{ status: string; count: number }[]> {
  await dbConnect();
  
  const pipeline: any[] = [];
  
  // Add match stage if dateRange is provided
  if (dateRange) {
    pipeline.push({
      $match: {
        createdAt: {
          $gte: new Date(dateRange.startDate),
          $lte: new Date(dateRange.endDate)
        }
      }
    });
  }
  
  // Add the rest of the pipeline stages
  pipeline.push(
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  );
  
  return await Order.aggregate(pipeline);
}

static async getMonthlyRevenue(dateRange: { startDate: string; endDate: string }): Promise<{
  month: string;
  revenue: number;
  orderCount: number;
}[]> {
  await dbConnect();
  
  const pipeline: any[]  = [
    {
      $match: {
        createdAt: {
          $gte: new Date(dateRange.startDate),
          $lte: new Date(dateRange.endDate)
        },
        status: { $in: ['completed', 'shipped', 'delivered'] } // Only count completed orders
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        revenue: { $round: ['$revenue', 2] },
        orderCount: 1
      }
    },
    {
      $sort: { month: 1 }
    }
  ];
  
  return await Order.aggregate(pipeline);
}

static async getDailyRevenue(dateRange: { startDate: string; endDate: string }): Promise<{
  date: string;
  revenue: number;
  orderCount: number;
}[]> {
  await dbConnect();
  
  const pipeline: any[]  = [
    {
      $match: {
        createdAt: {
          $gte: new Date(dateRange.startDate),
          $lte: new Date(dateRange.endDate)
        },
        status: { $in: ['completed', 'shipped', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            }
          }
        },
        revenue: { $round: ['$revenue', 2] },
        orderCount: 1
      }
    },
    {
      $sort: { date: 1 }
    }
  ];
  
  return await Order.aggregate(pipeline);
}

static async getTopCustomers(limit: number = 10): Promise<{
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
}[]> {
  await dbConnect();
  
  const pipeline: any[] = [
    {
      $match: {
        status: { $in: ['completed', 'shipped', 'delivered'] }
      }
    },
    {
      $group: {
        _id: '$shippingAddress.email',
        name: { 
          $first: {
            $concat: ['$shippingAddress.firstName', ' ', '$shippingAddress.lastName']
          }
        },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $project: {
        _id: 0,
        email: '$_id',
        name: 1,
        totalOrders: 1,
        totalSpent: { $round: ['$totalSpent', 2] },
        lastOrderDate: 1
      }
    },
    {
      $sort: { totalSpent: -1 }
    },
    {
      $limit: limit
    }
  ];
  
  return await Order.aggregate(pipeline);
}

static async getOrdersByPaymentStatus(paymentStatus?: string): Promise<IOrder[]> {
  await dbConnect();
  
  const filter: any = {};
  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }
  
  return await Order.find(filter)
    .sort({ createdAt: -1 });
}

static async getAverageOrderValue(dateRange?: { startDate: string; endDate: string }): Promise<number> {
  await dbConnect();
  
  const matchStage: any = {
    status: { $in: ['completed', 'shipped', 'delivered'] }
  };
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        averageOrderValue: { $avg: '$total' }
      }
    }
  ];
  
  const result = await Order.aggregate(pipeline);
  return result[0]?.averageOrderValue || 0;
}

static async getOrderTrends(days: number = 30): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  growthRate: number;
  revenueGrowthRate: number;
}> {
  await dbConnect();
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date();
  previousStartDate.setDate(previousEndDate.getDate() - days);
  
  const [currentPeriod, previousPeriod] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lte: previousEndDate },
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ])
  ]);
  
  const current = currentPeriod[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
  const previous = previousPeriod[0] || { totalOrders: 0, totalRevenue: 0 };
  
  const growthRate = previous.totalOrders > 0 
    ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 
    : 0;
    
  const revenueGrowthRate = previous.totalRevenue > 0 
    ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
    : 0;
  
  return {
    totalOrders: current.totalOrders,
    totalRevenue: Math.round(current.totalRevenue * 100) / 100,
    averageOrderValue: Math.round(current.averageOrderValue * 100) / 100,
    growthRate: Math.round(growthRate * 100) / 100,
    revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100
  };
}

}