import mongoose, { Schema, Document } from 'mongoose';

interface IPathaoOrder {
  consignment_id: string;
  order_status: string;
  delivery_fee: number;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
  pickup_date?: string;
  delivery_date?: string;
}

const PathaoOrderSchema = new Schema<IPathaoOrder>({
  consignment_id: { type: String, required: true },
  order_status: { type: String, required: true, default: 'pending_pickup' },
  delivery_fee: { type: Number, default: 0 },
  invoice_id: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  pickup_date: { type: String },
  delivery_date: { type: String }
}, { _id: false });

// Cart/Order Item Schema — flexible for Contentful data
const OrderItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String },
  title: { type: String },
  productName: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  imageUrl: { type: String },
  variant: { type: String },
  sku: { type: String },
  slug: { type: String },
  product: {
    id: String,
    title: String,
    slug: String,
    sku: String,
    images: [{
      url: String,
      title: String
    }]
  }
}, { _id: false });

const ShippingAddressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String },
  country: { type: String, required: true, default: 'BD' }
}, { _id: false });

const PaymentMethodSchema = new Schema({
  type: {
    type: String,
    enum: ['card', 'paypal', 'stripe', 'cod', 'bkash', 'nagad'],
    required: true
  },
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  cardholderName: String,
  last4: String
}, { _id: false });

export interface IOrder extends Document {
  orderNumber: string;
  items: typeof OrderItemSchema[];
  shippingAddress: typeof ShippingAddressSchema;
  paymentMethod: typeof PaymentMethodSchema;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  pathaoOrder?: IPathaoOrder;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () =>
      'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  items: [OrderItemSchema],
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
  },
  pathaoOrder: {
    type: PathaoOrderSchema,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'shippingAddress.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ 'pathaoOrder.consignment_id': 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
