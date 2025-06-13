'use client'

import React, { useState } from 'react';
import { ShoppingCart, Heart, Phone, User, ChevronDown, Trash, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/useCartStore';
import { useFavoritesStore } from '@/stores/useFavoriteStore';
import { Badge } from '../ui/Badge';

const Header = () => {
  const favoriteItemCount = useFavoritesStore(state => state.getTotalFavorites());
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cartItemCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        {/* Top bar with contact */}
        <div className="md:hidden container mx-auto p-4 text-sm text-gray-700 flex flex-col md:flex-row items-center justify-between">
          <span className="w-full text-center font-semibold">Need Help? Call us: <strong className="text-[#247a95]">01799804899</strong></span>
        </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-row sm:items-center justify-between gap-y-2 h-auto sm:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/muskan-logo.png"
              alt="Muskan Online Shop Logo"
              width={120}
              height={50}
              className="object-contain"
              priority={true}
            />
          </Link>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Contact Number */}
          <div className="hidden md:flex items-center space-x-2 text-sm sm:text-base">
            <Phone className="w-7 h-7 text-[#247a95]" />
            <div className="flex flex-col sm:space-x-2">
              <span className="text-xs sm:text-sm font-semibold uppercase opacity-50">Call Us</span>
              <span className="font-bold text-[#247a95] text-base sm:text-lg">01799804899</span>
            </div>
          </div>

            <Link href="/favorites" className="relative">
              <Heart className="h-6 w-6 text-foreground hover:text-[#247a95] transition-colors" />
              {favoriteItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-[#247a95] text-white text-xs flex items-center justify-center">
                  {favoriteItemCount}
                </Badge>
              )}
            </Link>

            {/* Cart with Dropdown */}
            <div 
              className="relative"
            >
              <div className="relative cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-foreground hover:text-[#247a95] transition-colors" onClick={() => setIsCartOpen(!isCartOpen)} />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-[#ff4d4f] text-white text-xs flex items-center justify-center">
                    {cartItemCount}
                  </Badge>
                )}
              </div>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-2xl rounded-xl border z-50 max-h-[70vh] overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
                    <p className="text-sm text-gray-600">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-6 text-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Your cart is empty</p>
                      <Link href="/">
                        <span className="inline-block mt-3 px-4 py-2 bg-[#247a95] text-white text-sm rounded-lg hover:bg-[#1e5f75] transition">
                          Continue Shopping
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items */}
                      <div className="max-h-80 overflow-y-auto">
                        {items.map(item => {
                          const imageUrl = item.product?.fields?.images?.[0]?.fields?.file?.url;
                          const imageAlt = item.product?.fields?.images?.[0]?.fields?.title || item.title;
                          const price = item.product?.fields?.discountedPrice ?? item.price;

                          return (
                            <div key={item.id} className="p-4 border-b hover:bg-gray-50 transition">
                              <div className="flex gap-3">
                                {/* Product Image */}
                                {imageUrl && (
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                                    <Image
                                      src={`https:${imageUrl}`}
                                      alt={imageAlt}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-800 truncate">
                                    {item.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">৳{price.toFixed(2)} each</p>
                                  
                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="text-red-500 hover:text-red-700 transition"
                                      aria-label={`Remove ${item.title}`}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  <p className="text-sm font-semibold text-gray-700 mt-1">
                                    ৳{(item.quantity * price).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="flex justify-between items-center mb-3">
                          <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                          >
                            <Trash className="w-4 h-4" />
                            Clear Cart
                          </button>
                          <p className="text-lg font-bold text-gray-800">
                            Total: ৳{getTotalPrice().toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href="/cart" className="flex-1" onClick={() => setIsCartOpen(false)}>
                            <button className="w-full py-2 px-4 border border-[#247a95] text-[#247a95] rounded-lg hover:bg-[#247a95] hover:text-white transition text-sm font-medium">
                              View Cart
                            </button>
                          </Link>
                          <Link href="/checkout" className="flex-1" onClick={() => setIsCartOpen(false)}>
                            <button className="w-full py-2 px-4 bg-[#247a95] text-white rounded-lg hover:bg-[#1e5f75] transition text-sm font-medium">
                              Checkout
                            </button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;