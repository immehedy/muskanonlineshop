'use client'

import React from 'react';
import { ShoppingCart, Heart, Phone, User, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/useCartStore';
import { useFavoritesStore } from '@/stores/useFavoriteStore';

const Header = () => {
  const favoriteItemCount = useFavoritesStore(state => state.getTotalFavorites());
  const cartItemCount = useCartStore(state => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        {/* Top bar with contact */}
        <div className="md:hidden container mx-auto p-4 text-sm text-gray-700 flex flex-col md:flex-row items-center justify-between">
          <span className="w-full text-center font-semibold">Need Help? Call us: <strong className="text-[#247a95]">+880 1234-567890</strong></span>
        </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-row sm:items-center justify-between gap-y-2 h-auto sm:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
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
          <div className="hidden md:flex items-center space-x-2 text-sm sm:text-base text-[#247a95]">
            <Phone className="w-7 h-7 text-[#247a95]" />
            <div className="flex flex-col sm:space-x-2">
              <span className="text-xs sm:text-sm text-sky-400 font-semibold uppercase opacity-50">Call Us</span>
              <span className="font-bold text-[#247a95] text-base sm:text-lg">+88 01799804899</span>
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

            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-[#247a95] transition-colors" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-[#ff4d4f] text-white text-xs flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Link>

            {/* <ChevronDown className="h-5 w-5 text-muted-foreground" /> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
