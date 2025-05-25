import { Metadata } from 'next';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import { getProducts, getCategories } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'All Products | Shop Our Collection',
  description: 'Browse our complete collection of products. Filter by category and find exactly what you need.',
};

export const revalidate = 3600; // Revalidate content every hour

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;
  
  const productsData = await getProducts(limit, skip);
  const categoriesData = await getCategories();
  
  const totalPages = Math.ceil(productsData.total / limit);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          {/* Category filters will go here */}
        </div>
        
        <div className="md:col-span-3">
          <ProductGrid products={productsData.items} />
          
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}