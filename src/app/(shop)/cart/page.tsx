'use client';

import { useCartStore } from '@/stores/useCartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-6">
            {items.map(item => {
              const imageUrl = item.product?.fields?.images?.[0]?.fields?.file?.url;
              const imageAlt = item.product?.fields?.images?.[0]?.fields?.title || item.title;

              return (
                <div key={item.id} className="flex items-start gap-4 border-b pb-4">
                  {imageUrl && (
                    <div className="relative w-24 h-24 shrink-0">
                      <Image
                        src={`https:${imageUrl}`}
                        alt={imageAlt}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-medium">{item.title}</h2>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <label htmlFor={`qty-${item.id}`} className="text-sm">
                        Qty:
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-red-500 text-sm hover:underline"
                      >
                        <Trash className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      Subtotal: ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="flex items-center gap-1 text-red-600 hover:underline text-sm"
            >
              <Trash className="w-4 h-4" />
              Clear Cart
            </button>
            <p className="text-lg font-semibold">
              Total: ${getTotalPrice().toFixed(2)}
            </p>
          </div>

          <div className="mt-4 text-right">
            <Link href="/checkout">
              <button className="px-6 py-2 bg-[#247a95] text-white rounded hover:bg-[#1e5f75] transition">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
