
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRelatedProducts } from '@/lib/contentful';
import { Product } from '@/types/contentful';

type RelatedProductsProps = {
  categoryIds: string[];
  currentProductId: string;
  limit?: number;
};

export default function RelatedProducts({
  categoryIds,
  currentProductId,
  limit = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        // Fetch products related by category, excluding the current product
        const relatedProducts = await getRelatedProducts(categoryIds, currentProductId, limit);
        setProducts(relatedProducts);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryIds.length > 0) {
      fetchRelatedProducts();
    } else {
      setIsLoading(false);
    }
  }, [categoryIds, currentProductId, limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-gray-500">No related products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link href={`/products/${product.fields.slug}`} key={product.sys.id} className="group">
          <div className="aspect-square relative rounded-md overflow-hidden bg-gray-50">
            {product.fields.mainImage && (
              <Image
                src={`https:${product.fields.mainImage.fields.file.url}`}
                alt={product.fields.mainImage.fields.title || product.fields.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
          </div>
          <h3 className="mt-3 font-medium group-hover:text-blue-600 transition-colors">
            {product.fields.name}
          </h3>
          <p className="mt-1 text-gray-800 font-semibold">৳{product.fields.price.toFixed(2)}</p>
        </Link>
      ))}
    </div>
  );
}