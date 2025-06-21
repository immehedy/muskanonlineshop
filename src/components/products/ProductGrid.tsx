import { Product } from '@/types/contentful';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.sys.id} product={product} />
      ))}
    </div>
  );
}