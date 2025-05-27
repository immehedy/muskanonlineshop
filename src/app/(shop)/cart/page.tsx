'use client';

import { useCartStore } from '@/stores/useCartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-600">Your cart is currently empty.</p>
          <Link href="/">
            <span className="inline-block mt-6 px-6 py-2 rounded-full bg-[#247a95] text-white font-medium hover:bg-[#1e5f75] transition">
              Continue Shopping
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <ul className="space-y-6">
            {items.map(item => {
              const imageUrl = item.product?.fields?.images?.[0]?.fields?.file?.url;
              const imageAlt = item.product?.fields?.images?.[0]?.fields?.title || item.title;

              return (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-6 bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
                >
                  {imageUrl && (
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={`https:${imageUrl}`}
                        alt={imageAlt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition flex items-center gap-1"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">৳{item.price.toFixed(2)} each</p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`qty-${item.id}`} className="text-sm font-medium">
                          Qty
                        </label>
                        <input
                          id={`qty-${item.id}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        Subtotal: ৳{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={clearCart}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                <Trash className="w-4 h-4" />
                Clear Cart
              </button>
              <p className="text-xl font-semibold text-gray-800">
                Total: ৳{getTotalPrice().toFixed(2)}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/checkout">
              <button className="px-10 py-3 bg-[#247a95] text-white text-lg rounded-full font-medium hover:bg-[#1e5f75] transition shadow">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
