import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/contentful';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit') || 8);
  const skip = Number(searchParams.get('skip') || 0);

  const products = await getProducts(limit, skip);

  return NextResponse.json({
    items: products.items,
    total: products.total,
    skip: products.skip,
    limit: products.limit,
  });
}