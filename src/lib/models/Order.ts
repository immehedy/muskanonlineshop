import mongoose, { Schema, Document } from 'mongoose';

// Cart Item Schema - Updated to handle Contentful data structure
const CartItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: false }, // Made optional
  title: { type: String, required: false }, // Common Contentful field
  productName: { type: String, required: false }, // Alternative field name
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  imageUrl: { type: String }, // Alternative image field
  variant: { type: String },
  sku: { type: String }, // Product SKU
  slug: { type: String } // Contentful slug
});

// Shipping Address Schema
const ShippingAddressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: false },
  country: { type: String, required: true, default: 'BD' }
});

// Payment Method Schema
const PaymentMethodSchema = new Schema({
  type: { type: String, enum: ['card', 'paypal', 'stripe', 'cod', 'bkash', 'nagad'], required: true },
  cardNumber: { type: String },
  expiryDate: { type: String },
  cvv: { type: String },
  cardholderName: { type: String },
  last4: { type: String } // Store only last 4 digits for security
});

// Order Interface
export interface IOrder extends Document {
  orderNumber: string;
  items: typeof CartItemSchema[];
  shippingAddress: typeof ShippingAddressSchema;
  paymentMethod: typeof PaymentMethodSchema;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

// Order Schema
const OrderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  items: [CartItemSchema],
  shippingAddress: { type: ShippingAddressSchema, required: true },
  paymentMethod: { type: PaymentMethodSchema, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

// Create indexes for better performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'shippingAddress.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
