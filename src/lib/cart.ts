import { CartItem } from '@/types/checkout';

export class CartManager {
  private static CART_KEY = 'cart';

  static getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const cart = sessionStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  static addToCart(item: CartItem): void {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    sessionStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  static updateQuantity(itemId: string, quantity: number): void {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }
      sessionStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }
  }

  static removeFromCart(itemId: string): void {
    const cart = this.getCart().filter(item => item.id !== itemId);
    sessionStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  static clearCart(): void {
    sessionStorage.removeItem(this.CART_KEY);
  }

  static getCartTotal(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  static getCartItemCount(): number {
    return this.getCart().reduce((count, item) => count + item.quantity, 0);
  }
}