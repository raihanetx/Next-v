'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import HeroSlider from '@/components/HeroSlider';
import CategoriesSection from '@/components/CategoriesSection';
import HotDealsSection from '@/components/HotDealsSection';
import ProductsSection from '@/components/ProductsSection';
import FeaturesSection from '@/components/FeaturesSection';
import ReviewSection from '@/components/ReviewSection';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const {
    products,
    categories,
    setProducts,
    setCategories,
    setSiteConfig,
    setCoupons,
    setHotDeals,
    siteConfig,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [productsRes, categoriesRes, configRes, couponsRes, hotDealsRes] =
          await Promise.all([
            fetch('/api/products'),
            fetch('/api/categories'),
            fetch('/api/site-config'),
            fetch('/api/coupons'),
            fetch('/api/hot-deals'),
          ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          setSiteConfig(configData);
        }

        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCoupons(couponsData);
        }

        if (hotDealsRes.ok) {
          const hotDealsData = await hotDealsRes.json();
          setHotDeals(hotDealsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setProducts, setCategories, setSiteConfig, setCoupons, setHotDeals]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-4xl text-[var(--primary-color)]"></i>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <div className="container mx-auto px-4 py-4">
          <HeroSlider />
        </div>

        <CategoriesSection />

        <HotDealsSection />

        {/* Products by Category */}
        {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => {
          const category = categories.find((c) => c.name === categoryName);
          if (!category) return null;

          return (
            <ProductsSection
              key={categoryName}
              categoryName={categoryName}
              products={categoryProducts.slice(0, 5)} // Show first 5 products
              categorySlug={category.slug}
            />
          );
        })}

        <FeaturesSection />

        <ReviewSection />
      </main>

      {/* Footer - only visible on home page */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Floating Action Button */}
      <Fab />

      {/* TrustBox script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
              a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
              tp('register', 'Fe0Kg2WfsOnYav1E');
          `,
        }}
      />
      <script
        type="text/javascript"
        src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        async
      />
    </div>
  );
}