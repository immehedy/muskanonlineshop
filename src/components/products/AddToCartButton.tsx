"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/contentful';
import { useCartStore } from '@/stores/useCartStore';

type AddToCartButtonProps = {
  product: any;
  disabled?: boolean;
};

// Initialize the cart from session storage on client-side
const initializeCart = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      useCartStore.setState({ items: parsedCart });
    }
  } catch (error) {
    console.error('Failed to load cart from session storage:', error);
  }
};

// Initialize cart from session storage on component mount
if (typeof window !== 'undefined') {
  initializeCart();
}

export default function AddToCartButton({ product, disabled = false }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Use the cart store
  const addToCart = useCartStore(state => state.addToCart);
  const cartItems = useCartStore(state => state.items);

  // Check if product is already in cart
  const productInCart = cartItems.find(item => item.id === product?.sys?.id);
  const currentQuantityInCart = productInCart?.quantity || 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    addToCart(product, quantity);
    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={decrementQuantity}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            aria-label="Decrease quantity"
          >
            <Minus size={18} />
          </button>
          <span className="px-3 py-2 w-12 text-center">{quantity}</span>
          <button
            onClick={incrementQuantity}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
            aria-label="Increase quantity"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isAdded || disabled}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md text-white font-medium transition-colors ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : isAdded
            ? "bg-green-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isAdding ? (
          <span>Adding...</span>
        ) : isAdded ? (
          <>
            <Check size={20} />
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
}