"use client";

import { useState } from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import AddToCartButton from "@/components/products/AddToCartButton";
import { Product } from "@/types/contentful";
import { RotateCcw, Truck } from "lucide-react";

interface ProductVariantSelectorProps {
  product: any;
}

export default function ProductVariantSelector({
  product,
}: ProductVariantSelectorProps) {
  const { fields } = product as unknown as Product;
  const variants = fields.variants || [];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  const currentPrice = selectedVariant?.fields?.price || fields.price;
  const currentDiscountedPrice =
    selectedVariant?.fields?.discountedPrice || fields.discountedPrice;
  const currentStockQty =
    selectedVariant?.fields?.stockQty ?? fields.stockQty;
  const currentSku = selectedVariant?.fields?.sku || fields.sku;

  const hasDiscount =
    currentDiscountedPrice && currentPrice > currentDiscountedPrice;

  const selectedProduct = {
    ...product,
    fields: {
      ...fields,
      selectedVariant,
      price: currentPrice,
      discountedPrice: currentDiscountedPrice,
      stockQty: currentStockQty,
      sku: currentSku,
    },
  };

  return (
    <>
      {/* Header Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="break-words bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl lg:text-4xl">
              {fields.title}
            </h1>

            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-gray-500 sm:text-sm">SKU:</span>
              <span className="break-all rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 sm:text-sm">
                {currentSku}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {currentStockQty > 0 ? (
              <div className="flex items-center space-x-2 rounded-full bg-green-50 px-3 py-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-700 sm:text-sm">
                  In Stock
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rounded-full bg-red-50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-700 sm:text-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {fields.rating && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < (fields.rating || 0) ? "currentColor" : "none"}
                  stroke="currentColor"
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    i < (fields.rating || 0)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>

            <span className="text-xs font-medium text-gray-600 sm:text-sm">
              {fields.rating} out of 5 stars
            </span>
          </div>
        )}
      </div>

      {/* Variant Selection */}
      {variants.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
              Select Variant
            </h3>
            <span className="text-xs font-medium text-gray-500">
              {variants.length} options
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {variants.map((variant: any) => {
              const isSelected = selectedVariant?.sys?.id === variant.sys.id;
              const isOutOfStock = variant.fields.stockQty === 0;

              return (
                <label
                  key={variant.sys.id}
                  className={`group relative cursor-pointer ${
                    isOutOfStock ? "cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={variant.sys.id}
                    checked={isSelected}
                    onChange={() => setSelectedVariant(variant)}
                    disabled={isOutOfStock}
                    className="sr-only"
                  />

                  <div
                    className={`
                      relative overflow-hidden rounded-2xl border px-4 py-3 text-center transition-all duration-300
                      ${
                        isSelected
                          ? "border-[#207b95] bg-[#207b95] text-white shadow-lg shadow-[#207b95]/25"
                          : "border-gray-200 bg-gray-50 text-gray-800 hover:border-[#207b95]/40 hover:bg-white hover:shadow-md"
                      }
                      ${
                        isOutOfStock
                          ? "opacity-45 line-through"
                          : "hover:-translate-y-0.5"
                      }
                    `}
                  >
                    <span className="block text-sm font-semibold">
                      {variant.fields.name}
                    </span>

                    <span
                      className={`mt-1 block text-xs ${
                        isSelected ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {variant.fields.discountedPrice
                        ? `৳${variant.fields.discountedPrice}`
                        : `৳${variant.fields.price}`}
                    </span>

                    {isSelected && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  {isOutOfStock && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-red-600 shadow-sm">
                      OUT
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Section */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 sm:rounded-2xl sm:p-6">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-baseline sm:space-x-4 sm:space-y-0">
          {hasDiscount ? (
            <>
              <span className="bg-gradient-to-r from-[#207b95] to-[#155d72] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                ৳{currentDiscountedPrice?.toFixed(2)}
              </span>

              <div className="flex items-center space-x-3">
                <span className="text-lg font-medium text-gray-400 line-through sm:text-xl">
                  ৳{currentPrice.toFixed(2)}
                </span>

                <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700 sm:px-3 sm:text-sm">
                  Save ৳
                  {(currentPrice - (currentDiscountedPrice || 0)).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ৳{currentPrice.toFixed(2)}
            </span>
          )}
        </div>

        {currentStockQty > 0 && currentStockQty <= 10 && (
          <div className="mt-3 flex items-center space-x-2">
            <svg
              className="h-4 w-4 flex-shrink-0 text-orange-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>

            <span className="text-xs font-medium text-orange-600 sm:text-sm">
              Only {currentStockQty} left in stock
            </span>
          </div>
        )}
      </div>

      {/* Desktop Order Button - Below Price */}
      <div className="hidden sm:block">
        <AddToCartButton
          product={selectedProduct}
          disabled={currentStockQty === 0}
        />
      </div>

      {/* Description Section */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <h3 className="mb-3 flex items-center text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">
          <svg
            className="mr-2 h-4 w-4 flex-shrink-0 text-[#207b95] sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z"
            />
          </svg>
          Product Details
        </h3>

        <div className="prose prose-sm max-w-none text-gray-700 sm:prose">
          {documentToReactComponents(fields.description)}
        </div>
      </div>

      {/* Mobile Sticky Order Button */}
      <div className="sm:hidden">
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <AddToCartButton
            product={selectedProduct}
            disabled={currentStockQty === 0}
          />
        </div>
      </div>

      {/* Out of Stock Message */}
      {currentStockQty === 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
          <div className="flex items-start space-x-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 sm:h-5 sm:w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>

            <span className="text-sm font-medium text-red-700 sm:text-base">
              This item is currently out of stock
            </span>
          </div>
        </div>
      )}

      {/* Features/Benefits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:rounded-xl sm:p-4">
          <div className="flex items-center space-x-3">
            <Truck className="mb-2 h-6 w-6 text-[#207b95]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-900 sm:text-base">
                Home Delivery
              </p>
              <p className="text-xs text-blue-700">Fast and Secure</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 p-3 sm:rounded-xl sm:p-4">
          <div className="flex items-center space-x-3">
            <RotateCcw className="mb-2 h-6 w-6 text-[#207b95]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-900 sm:text-base">
                Easy Returns
              </p>
              <p className="text-xs text-green-700">Easy return policy</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}