"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import { useFavoritesStore } from "@/stores/useFavoriteStore";

export default function FavoritesPage() {
  const { items, removeFromFavorites } = useFavoritesStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfd] via-white to-[#eef8fb] px-3 py-10">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur md:flex-row">
          <div className="text-center md:text-left">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#247a95]/10 text-[#247a95] md:mx-0">
              <Heart className="h-7 w-7" fill="currentColor" />
            </div>

            <h1 className="text-3xl font-black text-[#1A1F2C] md:text-4xl">
              My Favorites
            </h1>

            <p className="mt-2 text-sm text-gray-500 md:text-base">
              You have{" "}
              <span className="font-bold text-[#247a95]">{items.length}</span>{" "}
              favorite product{items.length !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-[2rem] border border-white/70 bg-white/90 px-6 py-14 text-center shadow-sm backdrop-blur">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#247a95]/10">
              <ShoppingBag className="h-10 w-10 text-[#247a95]" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-[#1A1F2C]">
              No favorites yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Browse products and tap the heart icon to save your favorite items
              here.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-[#247a95] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#247a95]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f6c83]">
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Favorites Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromFavorites(item.id)}
                    className="absolute right-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-lg backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-red-500 hover:text-white"
                    aria-label="Remove favorite">
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ProductCard product={item.product} />
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 rounded-[2rem] border border-white/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur">
              <h3 className="text-2xl font-black text-[#1A1F2C]">
                Continue Shopping
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Discover more amazing products curated for you.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex rounded-full bg-[#247a95] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#247a95]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f6c83]">
                Browse Products
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
