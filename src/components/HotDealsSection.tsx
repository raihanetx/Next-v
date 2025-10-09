'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function HotDealsSection() {
  const { hotDeals, products, siteConfig } = useAppStore();

  if (!hotDeals || hotDeals.length === 0) {
    return null;
  }

  // Create product map for quick lookup
  const productMap = new Map();
  products.forEach((product) => {
    productMap.set(product.id, product);
  });

  // Prepare hot deals to render
  const hotDealsToRender = hotDeals
    .map((deal) => {
      const product = productMap.get(deal.productId);
      if (!product) return null;

      return {
        href: `/${product.categorySlug}/${product.slug}`,
        image: product.image || 'https://via.placeholder.com/120x120.png?text=No+Image',
        name: deal.customTitle || product.name,
        product,
      };
    })
    .filter(Boolean);

  if (hotDealsToRender.length === 0) {
    return null;
  }

  // Duplicate for seamless scrolling
  const duplicatedDeals = [...hotDealsToRender, ...hotDealsToRender];
  const animationDuration = siteConfig?.hotDealsSpeed || 40;

  return (
    <section className="py-6 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl font-bold font-display tracking-wider">Hot Deals</h2>
      </div>
      <div className="hot-deals-container">
        <div
          className="hot-deals-scroller"
          style={{
            animationDuration: `${animationDuration}s`,
          }}
        >
          {duplicatedDeals.map((deal, index) => (
            <Link
              key={index}
              href={deal.href}
              className="hot-deal-card"
            >
              <div className="hot-deal-image-container">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="hot-deal-image"
                />
              </div>
              <span className="hot-deal-title">{deal.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}