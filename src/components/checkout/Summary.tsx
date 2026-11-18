"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

export function OrderSummary({ shipping = 0, tax = 0 }: any) {
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const formatPrice = (value: number) => `৳${Number(value || 0).toFixed(2)}`;

  const subtotal = cartItems.reduce((total: number, item: any) => {
    const price = item.product?.fields?.discountedPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const total = subtotal + Number(shipping || 0) + Number(tax || 0);

  return (
    <aside className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30 lg:sticky lg:top-4">
      <div className="bg-[#207b95] px-4 py-3 text-white lg:px-5 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold lg:text-xl">অর্ডার সামারি</h2>
            <p className="text-xs text-white/80 lg:text-sm">
              {cartItems.length} টি পণ্য
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/80">সর্বমোট</p>
            <p className="text-lg font-extrabold lg:text-xl">
              {formatPrice(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="mb-4 space-y-2.5">
          {cartItems.map((item: any) => {
            const currentPrice =
              item.product?.fields?.discountedPrice || item.price;

            const originalPrice = item.product?.fields?.price;
            const hasDiscount = originalPrice && currentPrice < originalPrice;
            const itemTotal = currentPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {item.product?.fields?.sku && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">
                          SKU: {item.product.fields.sku}
                        </span>
                      )}

                      <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#207b95] disabled:cursor-not-allowed disabled:opacity-40">
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="min-w-[22px] text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#207b95] text-white transition hover:bg-[#17687f]">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

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
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">মোট</p>
                      <p className="text-sm font-extrabold text-slate-950">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                      aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-2xl bg-slate-50 p-3 text-xs lg:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>সাবটোটাল</span>
            <span className="font-medium text-slate-800">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>শিপিং</span>
            <span className="font-medium text-slate-800">
              {shipping > 0 ? formatPrice(shipping) : "ফ্রি"}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>ট্যাক্স</span>
            <span className="font-medium text-slate-800">
              {formatPrice(tax)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-slate-300 pt-3">
            <span className="text-sm font-bold text-slate-900">সর্বমোট</span>
            <span className="text-xl font-extrabold text-[#207b95]">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
