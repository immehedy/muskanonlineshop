import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import RelatedProducts from '@/components/products/RelatedProducts';
import { getProductBySlug } from '@/lib/contentful';
import { Product } from '@/types/contentful';
import { RotateCcw, Truck } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramdata = await params;
  const product = await getProductBySlug(paramdata.slug);

  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  const { fields } = product as unknown as Product;
  
  return {
    title: fields.metaTitle || fields.title,
    description: fields.metaDescription || (typeof fields.description === 'string' ? fields.description.substring(0, 160) : 'View product details'),
    openGraph: {
      images: [
        {
          url: `https:${fields.images[0].fields.file.url}`,
          width: fields.images[0].fields.file.details.image.width,
          height: fields.images[0].fields.file.details.image.height,
          alt: fields.images[0].fields.title,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }
  
  const { fields } = product as unknown as Product;
  
  const hasDiscount = fields.discountedPrice && fields.price > fields.discountedPrice;
  const discountPercentage = hasDiscount && fields.discountedPrice 
    ? Math.round(((fields.price - fields.discountedPrice) / fields.price) * 100) 
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          
          {/* Image Gallery Section */}
          <div className="relative order-1 lg:order-1">
            {/* Decorative background element - hidden on mobile for cleaner look */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[#277a92]/5 to-transparent rounded-3xl hidden sm:block"></div>
            <div className="relative overflow-hidden">
              <ProductImageGallery images={fields.images} />
            </div>
          </div>
          
          {/* Product Details Section */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-2">
            {/* Header Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight break-words">
                    {fields.title}
                  </h1>
                  
                  {/* SKU */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500">SKU:</span>
                    <span className="text-xs sm:text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">
                      {fields.sku}
                    </span>
                  </div>
                </div>
                
                {/* Stock Status */}
                <div className="flex-shrink-0">
                  {fields.stockQty > 0 ? (
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-medium text-green-700">In Stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-red-700">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rating Section */}
              {fields.rating && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={fields.rating ? i < fields.rating ? "currentColor" : "none" : "none"}
                        stroke="currentColor"
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          fields.rating ? i < fields.rating ? "text-yellow-400" : "text-gray-300" : "text-gray-300"
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    {fields.rating} out of 5 stars
                  </span>
                </div>
              )}
            </div>
            
            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-4">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#277a92] to-[#1a5a6b] bg-clip-text text-transparent">
                    ৳{fields.discountedPrice?.toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg sm:text-xl text-gray-400 line-through font-medium">
                      ৳{fields.price.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        Save ৳{(fields.price - (fields.discountedPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    ${fields.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {fields.stockQty > 0 && fields.stockQty <= 10 && (
                <div className="mt-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs sm:text-sm text-orange-600 font-medium">
                    Only {fields.stockQty} left in stock
                  </span>
                </div>
              )}
            </div>
            
            {/* Description Section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#277a92] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Product Details
              </h3>
              <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed">
                {documentToReactComponents(fields.description)}
              </div>
            </div>
            
            {/* Add to Cart Section */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <AddToCartButton 
                      product={product} 
                      disabled={fields.stockQty === 0}
                    />
                  </div>
                </div>
                
                {fields.stockQty === 0 && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium text-sm sm:text-base">This item is currently out of stock</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Features/Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-[#247a95] mb-2" />
                  <div className="min-w-0">
                    <p className="font-semibold text-blue-900 text-sm sm:text-base">Home Delivery</p>
                    <p className="text-xs text-blue-700">Fast and Secure</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-[#247a95] mb-2" />
                  <div className="min-w-0">
                    <p className="font-semibold text-green-900 text-sm sm:text-base">Easy Returns</p>
                    <p className="text-xs text-green-700">Easy return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}