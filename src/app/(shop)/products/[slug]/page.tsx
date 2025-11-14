import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import { getProductBySlug } from '@/lib/contentful';
import { Product } from '@/types/contentful';
import ProductVariantSelector from '@/components/products/ProductVariantSelector';
import { ProductDetailsStatic } from '@/components/products/ProductDetailsStatic';

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
  
  // Check if product has variants
  const hasVariants = fields.variants && fields.variants.length > 0;
  
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
            {/* Pass product with variants to client component */}
            {hasVariants ? (
              <ProductVariantSelector product={product} />
            ) : (
              /* Original static content for products without variants */
              <ProductDetailsStatic product={product} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}