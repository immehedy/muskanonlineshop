export interface ContentfulImage {
    sys: {
      id: string;
    };
    fields: {
      title: string;
      description: string;
      file: {
        url: string;
        details: {
          image: {
            width: number;
            height: number;
          };
        };
      };
    };
  }
  
  export interface Category {
    sys: {
      id: string;
    };
    fields: {
      title: string;
      slug: string;
      description?: string;
      image?: ContentfulImage;
    };
  }
  
  export interface Product {
    sys: {
      space: object;
      id: string;
      type: string;
      createdAt: string;
      updatedAt: string;
      environment: object;
      publishedVersion: number;
      revision: number;
      contentType: object;
      locale: string;
    };
    fields: {
      title: string;               // Changed from "name" to "title" (Entry title field)
      slug: string;
      description: any;            // Rich text
      images: ContentfulImage[];   // Media, many files
      price: number;
      discountedPrice?: number;    // Changed from "compareAtPrice" to "discountedPrice"
      sku: string;
      stockQty: number;            // New field (Integer)
      categories: Category[];        // References, many
      rating?: number;             // New field (Integer)
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;       // New field
      openGraphImage?: ContentfulImage; // New field
      tags?: string[];             // New field (Short text, list)
      published: boolean;          // New field
    };
  }

  