'use client'

import { useFavoritesStore } from '@/stores/useFavoriteStore';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ product }: { product: any }) => {
  const isFavorite = useFavoritesStore(state => state.isFavorite(product.sys.id));
  const addToFavorites = useFavoritesStore(state => state.addToFavorites);
  const removeFromFavorites = useFavoritesStore(state => state.removeFromFavorites);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(product.sys.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className="transition"
      aria-label="Toggle Favorite"
    >
      <Heart
        className={`w-6 h-6 transition-colors duration-200 ${
          isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:fill-red-500'
        }`}
      />
    </button>
  );
};

export default FavoriteButton;
