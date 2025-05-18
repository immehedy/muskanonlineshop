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
    <div className="group relative">
      {/* FavoriteButton outside of Link to avoid click hijacking */}
      <div className="absolute top-2 right-2 z-20">
        <FavoriteButton product={product} />
      </div>

      <Link href={`/products/${fields.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
          {mainImage?.fields?.file && (
            <Image
              src={`https:${mainImage.fields.file.url}`}
              alt={mainImage.fields.title || fields.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          )}

          {fields.stockQty <= 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium line-clamp-2">{fields.title}</h3>
          <div className="mt-1 flex items-center">
            {hasDiscount ? (
              <>
                <span className="font-semibold">${formattedDiscountPrice}</span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${formattedPrice}
                </span>
              </>
            ) : (
              <span className="font-semibold">${formattedPrice}</span>
            )}
          </div>

          <div className="mt-1 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={fields?.rating ? i < fields?.rating ? "currentColor" : "none" : "none"}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-500">({fields.rating ?? 0}/5)</span>
          </div>

          {fields.categories?.length > 0 && (
            <div className="mt-1">
              <span className="text-xs text-gray-500">{fields.categories[0].fields.title}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
