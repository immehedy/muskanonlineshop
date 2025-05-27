"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/contentful';
import { useCartStore } from '@/stores/useCartStore';

type AddToCartButtonProps = {
  product: any;
  disabled?: boolean;
  className?: string;
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

export default function AddToCartButton({ product, disabled = false, className }: AddToCartButtonProps) {
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
    <div className="space-y-3 sm:space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex items-center border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white shadow-sm">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="px-3 py-2 sm:px-4 sm:py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg sm:rounded-l-xl"
            aria-label="Decrease quantity"
          >
            <Minus size={16} className="sm:w-5 sm:h-5" />
          </button>
          
          <div className="px-4 py-2 sm:px-6 sm:py-3 min-w-[3rem] sm:min-w-[4rem] text-center font-semibold text-gray-900 bg-gray-50 border-x border-gray-200">
            <span className="text-sm sm:text-base">{quantity}</span>
          </div>
          
          <button
            onClick={incrementQuantity}
            className="px-3 py-2 sm:px-4 sm:py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors rounded-r-lg sm:rounded-r-xl"
            aria-label="Increase quantity"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Quantity Label - Mobile Only */}
        <span className="ml-3 text-sm text-gray-600 sm:hidden">Qty</span>
      </div>
      
      {/* Current Cart Info */}
      {currentQuantityInCart > 0 && (
        <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
          <ShoppingCart size={14} className="sm:w-4 sm:h-4 text-blue-600" />
          <span>
            {currentQuantityInCart} already in cart
          </span>
        </div>
      )}
      
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isAdded || disabled}
        className={`
          w-full flex items-center justify-center gap-2 sm:gap-3 
          py-3 sm:py-4 px-4 sm:px-6 
          rounded-lg sm:rounded-xl 
          text-white font-bold 
          text-sm sm:text-base
          transition-all duration-300 
          transform hover:scale-105 
          shadow-lg hover:shadow-xl 
          disabled:hover:scale-100
          ${className || ''}
          ${
            disabled
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : isAdded
              ? "bg-green-600 hover:bg-green-700"
              : isAdding
              ? "bg-blue-500"
              : "bg-gradient-to-r from-[#277a92] to-[#1a5a6b] hover:from-[#1a5a6b] hover:to-[#0f3d47]"
          }
        `}
      >
        {isAdding ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Adding...</span>
          </>
        ) : isAdded ? (
          <>
            <Check size={18} className="sm:w-5 sm:h-5" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
            <span>Add to Cart {quantity > 1 ? `(${quantity})` : ''}</span>
          </>
        )}
      </button>
      
      {/* Mobile-specific additional info */}
      <div className="sm:hidden">
        {disabled ? (
          <p className="text-xs text-center text-red-600 bg-red-50 py-2 px-3 rounded-lg">
            Currently out of stock
          </p>
        ) : (
          <p className="text-xs text-center text-gray-500">
            Home delivery service
          </p>
        )}
      </div>
    </div>
  );
}