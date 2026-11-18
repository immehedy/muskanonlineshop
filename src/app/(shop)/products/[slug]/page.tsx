import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import {
  getProductBySlug,
  getRelatedProducts,
  getRecentProducts,
} from "@/lib/contentful";
import { Product } from "@/types/contentful";
import ProductVariantSelector from "@/components/products/ProductVariantSelector";
import { ProductDetailsStatic } from "@/components/products/ProductDetailsStatic";
import ProductCard from "@/components/products/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramdata = await params;
  const product = await getProductBySlug(paramdata.slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const { fields } = product as unknown as Product;

  return {
    title: fields.metaTitle || fields.title,
    description:
      fields.metaDescription ||
      (typeof fields.description === "string"
        ? fields.description.substring(0, 160)
        : "View product details"),
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { fields } = product as unknown as Product;

  const hasVariants = fields.variants && fields.variants.length > 0;

  const categoryIds =
    fields.categories?.map((category: any) => category.sys.id) ?? [];

  let relatedProducts: any[] = [];

  if (categoryIds.length > 0) {
    relatedProducts = await getRelatedProducts(categoryIds, product.sys.id, 4);
  }

  if (relatedProducts.length === 0) {
    relatedProducts = await getRecentProducts(product.sys.id, 4);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-1">
            <div className="absolute -inset-4 hidden rounded-3xl bg-gradient-to-br from-[#277a92]/5 to-transparent sm:block" />
            <div className="relative overflow-hidden">
              <ProductImageGallery images={fields.images} />
            </div>
          </div>

          <div className="order-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {hasVariants ? (
              <ProductVariantSelector product={product} />
            ) : (
              <ProductDetailsStatic product={product} />
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-16 lg:mt-20">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#277a92]">
                  You may also like
                </p>

                <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
                  Similar Products
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.sys.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
