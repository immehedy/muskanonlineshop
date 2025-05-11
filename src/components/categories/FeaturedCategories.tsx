import React from 'react'

interface CategoryFields {
  title: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
}

interface Category {
  sys: {
    id: string
  }
  fields: CategoryFields
}

interface FeaturedCategoriesProps {
  categories: Category[]
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories } : any) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Featured Categories</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category : any) => (
          <li key={category.sys.id} className="border p-4 rounded shadow hover:shadow-lg transition">
            <h3 className="text-lg font-semibold">{category.fields.title}</h3>
            <p className="text-sm text-gray-500">Slug: {category.fields.slug}</p>
            {category.fields.canonicalUrl && (
              <a
                href={category.fields.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Visit
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FeaturedCategories
