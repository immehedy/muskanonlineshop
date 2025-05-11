import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const previewClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
  host: 'preview.contentful.com',
});

export const getClient = (preview: boolean = false) => 
  preview ? previewClient : client;

  // Fetch all products with pagination support
export async function getHero(preview = false) {
  const client = getClient(preview);
  
  const response = await client.getEntry('6a5KvaN9Aji8TSJ8Fzknzn')
  
  return response;
}

// Fetch all products with pagination support
export async function getProducts(limit = 10, skip = 0, preview = false) {
  const client = getClient(preview);
  
  const response = await client.getEntries({
    content_type: 'product',
    limit,
    skip,
    include: 2,
  });
  
  return response;
}

// Fetch a single product by slug
export async function getProductBySlug(slug: string, preview = false) {
  const client = getClient(preview);
  
  const response = await client.getEntries({
    content_type: 'product',
    'fields.slug': slug,
    include: 2,
  });
  
  return response.items[0] || null;
}

// Fetch all product categories
export async function getCategories(preview = false) {
  const client = getClient(preview);
  
  const response = await client.getEntries({
    content_type: 'category',
  });
  
  return response.items;
}
