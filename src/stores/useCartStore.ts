import { create } from 'zustand';

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  product: any; // Replace with specific Product type if available
};

type CartState = {
  items: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// Helper to safely parse sessionStorage cart data
const getInitialCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = sessionStorage.getItem('cart');
  return stored ? JSON.parse(stored) : [];
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCartItems(), // Initialize with sessionStorage data

  addToCart: (product, quantity) => {
    const { items } = get();
    const existingIndex = items.findIndex(item => item.id === product.sys.id);

    if (existingIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      set({ items: updatedItems });
    } else {
      set({
        items: [
          ...items,
          {
            id: product.sys.id,
            title: product.fields.title,
            price: product.fields.price || 0,
            quantity,
            product,
          },
        ],
      });
    }
    sessionStorage.setItem('cart', JSON.stringify(get().items));
  },

  removeFromCart: (productId) => {
    const filtered = get().items.filter(item => item.id !== productId);
    set({ items: filtered });
    sessionStorage.setItem('cart', JSON.stringify(filtered));
  },

  updateQuantity: (productId, quantity) => {
    const updatedItems = get().items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    set({ items: updatedItems });
    sessionStorage.setItem('cart', JSON.stringify(updatedItems));
  },

  clearCart: () => {
    set({ items: [] });
    sessionStorage.removeItem('cart');
  },

  getTotalItems: () => get().items.length,

  getTotalPrice: () =>
    get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));
