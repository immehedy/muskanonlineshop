import { Product } from "./contentful";

export interface CartItem {
    id: string;
    name: string;
    title?:string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
    sku?:string;
    slug?: string;
    product?:Product;
  }
  
  export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  }
  
  export interface PaymentMethod {
    type: 'card' | 'paypal' | 'stripe' | 'cod' | 'bkash' | 'nagad';
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  }
  
  export interface Order {
    id: string;
    items: CartItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    note?: string;
    createdAt: Date;
    orderNumber: string;
  }


export interface OrderResponse {
  id: string;
  status: string;
  message: string;
  success: boolean;
  error?: string;
  orderId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data: T;
  error?: string; // optional: include for failed responses
}