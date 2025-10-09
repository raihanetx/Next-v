'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';

interface ProductsSectionProps {
  categoryName: string;
  products: any[];
  categorySlug: string;
}

export default function ProductsSection({
  categoryName,
  products,
  categorySlug,
}: ProductsSectionProps) {
  const { currency, siteConfig } = useAppStore();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <div className="flex justify-between items-center mb-4 px-4 md:px-6">
        <h2 className="text-2xl font-bold font-display tracking-wider">
          {categoryName}
        </h2>
        <Link
          href={`/products/category/${categorySlug}`}
          className="text-[var(--primary-color)] font-bold hover:text-[var(--primary-color-darker)] flex items-center text-lg"
        >
          View all <span className="ml-2 text-2xl font-bold">&raquo;</span>
        </Link>
      </div>
      <div className="product-scroll-container">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => (window.location.href = `/${product.categorySlug}/${product.slug}`)}
          >
            <Link
              href={`/${product.categorySlug}/${product.slug}`}
              className="contents"
            >
              <div className="product-card-image-container relative">
                <img
                  src={
                    product.image ||
                    'https://via.placeholder.com/400x300.png?text=No+Image'
                  }
                  alt={product.name}
                  className="product-image"
                />
                {product.stockOut && (
                  <div className="absolute top-2 right-2 bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Stock Out
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1 font-display tracking-wider">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 preserve-whitespace">
                  {product.description}
                </p>
                <div className="text-[var(--primary-color)] font-bold text-lg mb-2 mt-auto">
                  {formatPrice(
                    product.pricing[0]?.price || 0,
                    currency,
                    siteConfig?.usdToBdtRate
                  )}
                </div>
                <button className="w-full text-[var(--primary-color)] bg-transparent hover:bg-violet-50 font-semibold py-1 px-2 rounded-lg transition md:py-1 md:text-base text-sm flex items-center justify-center gap-2 border-2 border-[var(--primary-color)]">
                  View Details <i className="fas fa-arrow-up-right-from-square text-xs"></i>
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}