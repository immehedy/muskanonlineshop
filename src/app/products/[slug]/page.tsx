import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import RelatedProducts from '@/components/products/RelatedProducts';
import { getProductBySlug } from '@/lib/contentful';
import { Product } from '@/types/contentful';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  const { fields } = product as unknown as Product;
  
  return {
    title: fields.metaTitle || fields.name,
    description: fields.metaDescription || (typeof fields.description === 'string' ? fields.description.substring(0, 160) : 'View product details'),
    openGraph: {
      images: [
        {
          url: `https:${fields.mainImage.fields.file.url}`,
          width: fields.mainImage.fields.file.details.image.width,
          height: fields.mainImage.fields.file.details.image.height,
          alt: fields.mainImage.fields.title,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }
  
  const { fields } = product as unknown as Product;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <ProductImageGallery images={fields.images} />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">{fields.name}</h1>
          
          <div className="mt-4 flex items-center">
            <span className="text-2xl font-semibold">${fields.price.toFixed(2)}</span>
            {fields.compareAtPrice && (
              <span className="ml-3 text-lg text-gray-500 line-through">
                ${fields.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="mt-6 prose">
            {documentToReactComponents(fields.description)}
          </div>
          
          <div className="mt-8">
            <AddToCartButton product={product} disabled={!fields.inStock} />
          </div>
          
          {!fields.inStock && (
            <p className="mt-4 text-red-600">Currently out of stock</p>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold">SKU: {fields.sku}</h3>
            <div className="mt-2">
              <span className="font-medium">Categories: </span>
              {fields.categories.map((category, index) => (
                <span key={category.sys.id}>
                  {category.fields.name}
                  {index < fields.categories.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section - if available */}
      {fields.features && fields.features.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Product Features</h2>
          <div className="prose max-w-none">
            {/* Render features here */}
          </div>
        </div>
      )}
      
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <RelatedProducts 
          categoryIds={fields.categories.map(cat => cat.sys.id)} 
          currentProductId={product.sys.id} 
        />
      </div>
    </div>
  );
}