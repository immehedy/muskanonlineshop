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
    <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-lg">
      {/* Mobile Top Bar */}
      <div className="container mx-auto flex flex-col items-center justify-between p-3 text-sm text-gray-700 md:hidden">
        <span className="w-full text-center font-semibold">
          Need Help? Call us:{" "}
          <strong className="text-[#207b95]">01799804899</strong>
        </span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 flex-row items-center justify-between gap-y-2 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/muskan-logo.png"
              alt="Muskan Online Shop Logo"
              width={120}
              height={50}
              className="object-contain"
              priority
            />
          </Link>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Contact Number */}
            <div className="hidden items-center space-x-2 text-sm sm:text-base md:flex">
              <Phone className="h-7 w-7 text-[#207b95]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase opacity-50 sm:text-sm">
                  Call Us
                </span>
                <span className="text-base font-bold text-[#207b95] sm:text-lg">
                  01799804899
                </span>
              </div>
            </div>

            <Link href="/favorites" className="relative">
              <Heart className="h-6 w-6 text-foreground transition-colors hover:text-[#207b95]" />
              {favoriteItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-[#207b95] p-0 text-xs text-white">
                  {favoriteItemCount}
                </Badge>
              )}
            </Link>

            {/* Cart Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCartOpen((prev) => !prev)}
                className="relative"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6 text-foreground transition-colors hover:text-[#207b95]" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-red-500 p-0 text-xs text-white">
                    {cartItemCount}
                  </Badge>
                )}
              </button>

              {isCartOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/30">
                  {/* Header */}
                  <div className="bg-[#207b95] px-4 py-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold">Shopping Cart</h3>
                        <p className="text-xs text-white/80">
                          {cartItemCount} item
                          {cartItemCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-white/80">Total</p>
                        <p className="text-lg font-black">
                          {formatPrice(getTotalPrice())}
                        </p>
                      </div>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#207b95]/10">
                        <ShoppingBag className="h-7 w-7 text-[#207b95]" />
                      </div>

                      <h4 className="mt-4 text-base font-bold text-slate-900">
                        Your cart is empty
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Add items to checkout quickly.
                      </p>

                      <Link href="/" onClick={() => setIsCartOpen(false)}>
                        <span className="mt-4 inline-block rounded-full bg-[#207b95] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#17687f]">
                          Continue Shopping
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Items */}
                      <div className="max-h-[360px] space-y-2 overflow-y-auto bg-slate-50 p-3">
                        {items.map((item) => {
                          const imageUrl =
                            item.product?.fields?.images?.[0]?.fields?.file
                              ?.url;

                          const imageAlt =
                            item.product?.fields?.images?.[0]?.fields?.title ||
                            item.title;

                          const price =
                            item.product?.fields?.discountedPrice ??
                            item.price;

                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                            >
                              <div className="flex gap-3">
                                {imageUrl && (
                                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    <Image
                                      src={`https:${imageUrl}`}
                                      alt={imageAlt}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                                      {item.title}
                                    </h4>

                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(item.id)}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                                      aria-label={`Remove ${item.title}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <p className="mt-1 text-xs font-bold text-[#207b95]">
                                    {formatPrice(price)}
                                  </p>

                                  <div className="mt-2 flex items-center justify-between gap-2">
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
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-[#207b95] disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Minus className="h-3.5 w-3.5" />
                                      </button>

                                      <span className="min-w-[26px] text-center text-xs font-bold text-slate-900">
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
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#207b95] text-white transition hover:bg-[#17687f]"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                    </div>

                                    <p className="text-sm font-extrabold text-slate-900">
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
                        <div className="mb-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={clearCart}
                            className="flex items-center gap-1.5 text-sm font-semibold text-red-500 transition hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Clear
                          </button>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">Subtotal</p>
                            <p className="text-lg font-black text-[#207b95]">
                              {formatPrice(getTotalPrice())}
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/checkout"
                          onClick={() => setIsCartOpen(false)}
                        >
                          <button className="w-full rounded-2xl bg-[#207b95] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#207b95]/20 transition hover:bg-[#17687f]">
                            Checkout Now
                          </button>
                        </Link>
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