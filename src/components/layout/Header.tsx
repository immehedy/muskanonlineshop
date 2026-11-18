"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Phone,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/useCartStore";
import { useFavoritesStore } from "@/stores/useFavoriteStore";
import { Badge } from "../ui/Badge";

const Header = () => {
  const favoriteItemCount = useFavoritesStore((state) =>
    state.getTotalFavorites()
  );

  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemCount = getTotalItems();

  const formatPrice = (value: number) => `৳${Number(value || 0).toFixed(2)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 shadow-sm backdrop-blur-xl">
      {/* Mobile Top Bar */}
      <div className="bg-[#207b95] px-3 py-2 text-center text-xs font-semibold text-white md:hidden">
        Need Help? Call us: <span className="font-bold">01799804899</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/muskan-logo.png"
              alt="Muskan Online Shop Logo"
              width={132}
              height={54}
              className="object-contain"
              priority
            />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Contact */}
            <div className="hidden items-center gap-3 rounded-full border border-[#207b95]/10 bg-[#207b95]/5 px-4 py-2 md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#207b95] shadow-sm">
                <Phone className="h-5 w-5" />
              </div>

              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Call Us
                </p>
                <p className="text-base font-extrabold text-[#207b95]">
                  01799804899
                </p>
              </div>
            </div>

            {/* Favorites */}
            <Link
              href="/favorites"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#207b95]/30 hover:bg-[#207b95] hover:text-white"
              aria-label="Favorites">
              <Heart className="h-5 w-5" />

              {favoriteItemCount > 0 && (
                <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#207b95] px-1.5 text-[10px] font-bold text-white">
                  {favoriteItemCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#207b95]/30 hover:bg-[#207b95] hover:text-white"
                aria-label="Open cart">
                <ShoppingCart className="h-5 w-5" />

                {cartItemCount > 0 && (
                  <Badge className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {cartItemCount}
                  </Badge>
                )}
              </button>

              {isCartOpen && (
                <>
                  {/* Mobile backdrop */}
                  <button
                    type="button"
                    aria-label="Close cart backdrop"
                    onClick={() => setIsCartOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
                  />

                  <div className="absolute right-0 top-full z-50 mt-4 w-[calc(100vw-2rem)] max-w-[410px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
                    {/* Cart Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#207b95] to-[#155e73] px-5 py-5 text-white">
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            <h3 className="text-lg font-black">
                              Shopping Cart
                            </h3>
                          </div>

                          <p className="mt-1 text-sm text-white/75">
                            {cartItemCount} item
                            {cartItemCount !== 1 ? "s" : ""} in your cart
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCartOpen(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                          aria-label="Close cart">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="relative mt-4 rounded-2xl bg-white/12 p-3 backdrop-blur">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/75">Total</span>
                          <span className="text-2xl font-black">
                            {formatPrice(getTotalPrice())}
                          </span>
                        </div>
                      </div>
                    </div>

                    {items.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#207b95]/10">
                          <ShoppingBag className="h-8 w-8 text-[#207b95]" />
                        </div>

                        <h4 className="mt-5 text-lg font-black text-slate-900">
                          Your cart is empty
                        </h4>

                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                          Looks like you haven’t added anything yet.
                        </p>

                        <Link href="/" onClick={() => setIsCartOpen(false)}>
                          <span className="mt-5 inline-flex rounded-full bg-[#207b95] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#207b95]/20 transition hover:bg-[#17687f]">
                            Continue Shopping
                          </span>
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Items */}
                        <div className="max-h-[390px] space-y-3 overflow-y-auto bg-slate-50/80 p-3">
                          {items.map((item) => {
                            const imageUrl =
                              item.product?.fields?.images?.[0]?.fields?.file
                                ?.url;

                            const imageAlt =
                              item.product?.fields?.images?.[0]?.fields
                                ?.title || item.title;

                            const price =
                              item.product?.fields?.discountedPrice ??
                              item.price;

                            return (
                              <div
                                key={item.id}
                                className="group rounded-3xl border border-slate-100 bg-white p-3 shadow-sm transition hover:shadow-md">
                                <div className="flex gap-3">
                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                                    {imageUrl ? (
                                      <Image
                                        src={`https:${imageUrl}`}
                                        alt={imageAlt}
                                        fill
                                        sizes="80px"
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                                        <ShoppingBag className="h-6 w-6" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                                        {item.title}
                                      </h4>

                                      <button
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                                        aria-label={`Remove ${item.title}`}>
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <p className="mt-1 text-sm font-black text-[#207b95]">
                                      {formatPrice(price)}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between gap-2">
                                      <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              Math.max(1, item.quantity - 1)
                                            )
                                          }
                                          disabled={item.quantity <= 1}
                                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-[#207b95] disabled:cursor-not-allowed disabled:opacity-40">
                                          <Minus className="h-3.5 w-3.5" />
                                        </button>

                                        <span className="min-w-[30px] text-center text-sm font-black text-slate-900">
                                          {item.quantity}
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuantity(
                                              item.id,
                                              item.quantity + 1
                                            )
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#207b95] text-white transition hover:bg-[#17687f]">
                                          <Plus className="h-3.5 w-3.5" />
                                        </button>
                                      </div>

                                      <p className="text-sm font-black text-slate-900">
                                        {formatPrice(item.quantity * price)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200 bg-white p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={clearCart}
                              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white">
                              <Trash2 className="h-4 w-4" />
                              Clear Cart
                            </button>

                            <div className="text-right">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Subtotal
                              </p>
                              <p className="text-xl font-black text-[#207b95]">
                                {formatPrice(getTotalPrice())}
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/checkout"
                            onClick={() => setIsCartOpen(false)}>
                            <button className="w-full rounded-2xl bg-[#207b95] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#207b95]/25 transition hover:-translate-y-0.5 hover:bg-[#17687f]">
                              Checkout Now
                            </button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
