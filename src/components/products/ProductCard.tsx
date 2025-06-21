import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/contentful';
import FavoriteButton from '../ui/FavoriteButton';

export default function ProductCard({ product }: { product: Product }) {
  const { fields } = product;

  const mainImage = fields.images && Array.isArray(fields.images) && fields.images.length > 0 
    ? fields.images[0] 
    : null;

  const hasDiscount = fields.discountedPrice && fields.price > fields.discountedPrice;
  const formattedPrice = fields.price ? fields.price.toFixed(2) : "0.00";
  const formattedDiscountPrice = fields.discountedPrice ? fields.discountedPrice.toFixed(2) : "0.00";


  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 backdrop-blur-sm">
      {/* Gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10"></div>

      {/* FavoriteButton with enhanced styling */}
      <div className="absolute top-2 right-2 z-30">
        <FavoriteButton product={product} />
      </div>

      <Link href={`/products/${fields.slug}`} className="block h-full">
        {/* Image container with enhanced effects */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {mainImage?.fields?.file && (
            <Image
              src={`https:${mainImage.fields.file.url}`}
              alt={mainImage.fields.title || fields.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-all duration-700 ease-out"
              priority={false}
            />
          )}

          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Out of stock overlay */}
          {fields.stockQty <= 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/95 text-gray-900 font-bold px-4 py-2 rounded-full shadow-lg">
                Out of Stock
              </div>
            </div>
          )}

          {/* Stock indicator */}
          {fields.stockQty > 0 && fields.stockQty <= 5 && (
            <div className="absolute bottom-4 left-4 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
              Only {fields.stockQty} left
            </div>
          )}
        </div>

        {/* Content section with improved spacing and typography */}
        <div className="p-3 space-y-2">
          {/* Title with gradient text effect */}
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-2 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {fields.title}
          </h3>
          
          {/* Enhanced price section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ৳{formattedDiscountPrice}
                  </span>
                  <span className="text-sm text-gray-400 line-through font-medium">
                  ৳{formattedPrice}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ৳{formattedPrice}
                </span>
              )}
            </div>
          </div>

          {/* Enhanced rating section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={fields?.rating ? i < fields?.rating ? "currentColor" : "none" : "none"}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-colors duration-200 ${
                      fields?.rating && i < fields?.rating 
                        ? "text-yellow-400" 
                        : "text-gray-300"
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                ({fields.rating ?? 0})
              </span>
            </div>
            
            {/* Quick view indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center space-x-1 text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs font-medium">Quick View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle bottom border animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </Link>
    </div>
  );
}