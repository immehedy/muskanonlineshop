import { Metadata } from "next";
import Hero from "@/components/ui/Hero";
import { getProducts, getHero } from "@/lib/contentful";
import InfiniteProducts from "@/components/products/InfiniteProducts";

export const metadata: Metadata = {
  title: "Home | Shop Our Latest Products",
  description:
    "Discover our curated collection of high-quality products with fast shipping and great customer service.",
};

export const revalidate = 3600;

export default async function Home() {
  const productsData = await getProducts(8);
  const hero = await getHero();

  return (
    <div>
      <Hero hero={hero?.fields} />

      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center underline text-[#247a95]">
          New Arrivals
        </h2>

        <InfiniteProducts
          initialProducts={productsData.items}
          total={productsData.total}
        />
      </div>
    </div>
  );
}
