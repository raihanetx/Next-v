'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';

function ProductsPageContent() {
  const { products, categories, setProducts, currency, siteConfig, addToCart } = useAppStore();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [productsTitle, setProductsTitle] = useState('All Products');
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (products.length === 0) {
      fetchData();
    }
  }, [products.length, setProducts]);

  useEffect(() => {
    let filtered = [...products];

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
      setProductsTitle(`Search Results for "${search}"`);
    } else if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      setProductsTitle(`All ${category}`);
    } else {
      setProductsTitle('All Products');
    }

    setFilteredProducts(filtered);
  }, [products, search, category]);

  const handleAddToCart = (productId: string, durationIndex: number = 0) => {
    addToCart(productId, 1, durationIndex);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 font-display tracking-wider">
            {productsTitle}
          </h1>
          
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2 font-display tracking-wider">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or browse our categories.
              </p>
              <a
                href="/"
                className="inline-block px-8 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary-color-darker)] transition"
              >
                Browse Categories
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-grid-card"
                  onClick={() => (window.location.href = `/${product.categorySlug}/${product.slug}`)}
                >
                  <a
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
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 line-clamp-1 font-display tracking-wider">
                        {product.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2 preserve-whitespace">
                        {product.description}
                      </p>
                      <p className="text-lg md:text-xl font-extrabold text-[var(--primary-color)] mt-auto">
                        {formatPrice(
                          product.pricing[0]?.price || 0,
                          currency,
                          siteConfig?.usdToBdtRate
                        )}
                      </p>
                      <div className="flex flex-row gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id, 0);
                          }}
                          className="w-full border-2 border-[var(--primary-color)] text-[var(--primary-color)] bg-transparent hover:bg-[var(--primary-color)] hover:text-white transition py-1.5 px-2 sm:py-2 rounded-md text-xs sm:text-sm font-semibold"
                        >
                          Add to Cart
                        </button>
                        <button className="w-full bg-gray-200 text-gray-700 py-1.5 px-2 sm:py-2 rounded-md hover:bg-gray-300 transition text-xs sm:text-sm font-semibold">
                          View Details
                        </button>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
      <Fab />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}