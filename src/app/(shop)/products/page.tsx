import { Metadata } from 'next';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import { getProducts, getCategories } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'All Products | Shop Our Collection',
  description: 'Browse our complete collection of products. Filter by category and find exactly what you need.',
};

export const revalidate = 3600; // Revalidate content every hour

type ProductsPageProps = {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const productsData = await getProducts(limit, skip);

  const totalPages = Math.ceil(productsData.total / limit);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>

      <div>
          <ProductGrid products={productsData.items} />

          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
      </div>
    </div>
  );
}
