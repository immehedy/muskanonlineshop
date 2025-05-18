import { create } from 'zustand';

type FavoriteItem = {
  id: string;
  product: any; // Replace with your actual Product type if available
};

type FavoritesState = {
  items: FavoriteItem[];
  addToFavorites: (product: any) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getTotalFavorites: () => number;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],

  addToFavorites: (product) => {
    const { items } = get();
    if (!items.find(item => item.id === product.sys.id)) {
      const updated = [...items, { id: product.sys.id, product }];
      set({ items: updated });
      sessionStorage.setItem('favorites', JSON.stringify(updated));
    }
  },

  removeFromFavorites: (productId) => {
    const updated = get().items.filter(item => item.id !== productId);
    set({ items: updated });
    sessionStorage.setItem('favorites', JSON.stringify(updated));
  },

  isFavorite: (productId) => {
    return get().items.some(item => item.id === productId);
  },

  getTotalFavorites: () => get().items.length,
}));
