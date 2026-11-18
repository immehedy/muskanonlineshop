"use client";

import { useCartStore } from "@/stores/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();

  const formatPrice = (value: number) => `৳${Number(value || 0).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-slate-950 to-slate-700 bg-clip-text text-3xl font-black text-transparent lg:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="
                inline-flex items-center gap-2
                rounded-full border border-red-100
                bg-red-50 px-4 py-2
                text-sm font-semibold text-red-600
                transition hover:bg-red-500 hover:text-white
              ">
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#207b95]/10">
              <ShoppingBag className="h-10 w-10 text-[#207b95]" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Looks like you haven’t added anything yet.
            </p>

            <Link href="/">
              <button
                className="
                  mt-6 rounded-full bg-[#207b95]
                  px-6 py-3 text-sm font-semibold text-white
                  shadow-lg shadow-[#207b95]/20
                  transition hover:bg-[#17687f]
                ">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => {
                const imageUrl =
                  item.product?.fields?.images?.[0]?.fields?.file?.url;

                const imageAlt =
                  item.product?.fields?.images?.[0]?.fields?.title ||
                  item.title;

                const currentPrice =
                  item.product?.fields?.discountedPrice || item.price;

                const originalPrice = item.product?.fields?.price;

                const hasDiscount =
                  originalPrice && currentPrice < originalPrice;

                const subtotal = currentPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="
                      rounded-2xl border border-slate-200
                      bg-white p-4 shadow-sm
                      transition hover:shadow-md
                    ">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {imageUrl && (
                          <Image
                            src={`https:${imageUrl}`}
                            alt={imageAlt}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">
                              {item.title}
                            </h2>

                            {item.product?.fields?.sku && (
                              <div className="mt-1">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                                  SKU: {item.product.fields.sku}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="
                              flex h-8 w-8 items-center justify-center
                              rounded-full border border-red-100
                              bg-red-50 text-red-500
                              transition hover:bg-red-500 hover:text-white
                            "
                            aria-label={`Remove ${item.title}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="mt-2 flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(originalPrice)}
                              </span>

                              <span className="text-sm font-bold text-[#207b95]">
                                {formatPrice(currentPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-slate-800">
                              {formatPrice(currentPrice)}
                            </span>
                          )}
                        </div>

                        {/* Bottom */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          {/* Quantity */}
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
                              className="
                                flex h-7 w-7 items-center justify-center
                                rounded-full text-slate-500 transition
                                hover:bg-white hover:text-[#207b95]
                                disabled:cursor-not-allowed disabled:opacity-40
                              ">
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="min-w-[28px] text-center text-sm font-bold text-slate-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="
                                flex h-7 w-7 items-center justify-center
                                rounded-full bg-[#207b95] text-white transition
                                hover:bg-[#17687f]
                              ">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-[11px] text-slate-500">
                              Subtotal
                            </p>

                            <p className="text-base font-extrabold text-slate-950">
                              {formatPrice(subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside
              className="
                h-fit rounded-3xl border border-slate-200
                bg-white p-5 shadow-sm lg:sticky lg:top-6
              ">
              <h2 className="text-lg font-black text-slate-950">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-semibold text-slate-900">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>

                  <span className="font-semibold text-emerald-600">Free</span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-black text-[#207b95]">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button
                  className="
                    mt-6 w-full rounded-2xl bg-[#207b95]
                    px-6 py-3.5 text-sm font-bold text-white
                    shadow-lg shadow-[#207b95]/20
                    transition hover:bg-[#17687f]
                  ">
                  Proceed to Checkout
                </button>
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
