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
        const tax = this.calculateTax(subtotal, shippingAddress);
        const total = subtotal + shipping + tax;
      
        // Sanitize payment method for security
        const sanitizedPaymentMethod = {
          ...paymentMethod,
          cardNumber: undefined, // Never store full card number
          cvv: undefined, // Never store CVV
          last4: paymentMethod.cardNumber?.slice(-4)
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
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country
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
      
        console.log('Creating order:', {
          orderNumber,
          itemCount: items.length,
          subtotal,
          shipping,
          tax,
          total,
          customerEmail: shippingAddress.email
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
    const baseShipping = 5.99;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    return itemCount > 5 ? baseShipping + 2.99 : baseShipping;
  }

  static calculateTax(subtotal: number, address: ShippingAddress): number {
    const taxRates: { [key: string]: number } = {
      'CA': 0.0875, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
      'WA': 0.065,  // Washington
    };
    
    const taxRate = taxRates[address.state] || 0.06; // Default 6%
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
}