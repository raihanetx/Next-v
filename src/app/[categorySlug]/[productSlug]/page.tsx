'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';

export default function ProductDetailPage() {
  const { products, setProducts, currency, siteConfig, addToCart } = useAppStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 0, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  
  const params = useParams();
  const { categorySlug, productSlug } = params as { categorySlug: string; productSlug: string };
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);

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
    const product = products.find(p => p.categorySlug === categorySlug && p.slug === productSlug);
    setSelectedProduct(product || null);
    if (product) {
      setIsImageLoading(true);
      setSelectedDurationIndex(0);
      setActiveTab('description');
      setIsDescriptionExpanded(false);
    }
  }, [categorySlug, productSlug, products]);

  useEffect(() => {
    if (selectedProduct && window.innerWidth >= 768 && infoContainerRef.current) {
      const adjustImageSize = () => {
        const imageContainer = imageContainerRef.current;
        const infoContainer = infoContainerRef.current;
        
        if (imageContainer && infoContainer) {
          const infoHeight = infoContainer.offsetHeight;
          const parentContainer = imageContainer.parentElement;
          if (parentContainer) {
            const gap = parseInt(window.getComputedStyle(parentContainer).gap, 10) || 32;
            const maxImageWidth = parentContainer.clientWidth - infoContainer.offsetWidth - gap;
            const finalSize = Math.min(infoHeight, maxImageWidth);
            
            if (finalSize > 0) {
              imageContainer.style.height = `${finalSize}px`;
              imageContainer.style.width = `${finalSize}px`;
            }
          }
        }
      };

      adjustImageSize();
      const resizeObserver = new ResizeObserver(adjustImageSize);
      resizeObserver.observe(infoContainerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct.id, 1, selectedDurationIndex);
    }
  };

  const handleBuyNow = () => {
    if (selectedProduct) {
      // Store checkout item and redirect to checkout
      localStorage.setItem('checkoutItems', JSON.stringify([{
        productId: selectedProduct.id,
        quantity: 1,
        durationIndex: selectedDurationIndex
      }]));
      window.location.href = '/checkout';
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !newReview.name.trim() || newReview.rating === 0 || !newReview.comment.trim()) {
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReview,
          productId: selectedProduct.id
        })
      });

      if (res.ok) {
        // Refresh product data to include new review
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
        
        setNewReview({ name: '', rating: 0, comment: '' });
        setHoverRating(0);
        setReviewModalOpen(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const selectedPrice = selectedProduct?.pricing?.[selectedDurationIndex]?.price || 0;
  const selectedPriceFormatted = formatPrice(selectedPrice, currency, siteConfig?.usdToBdtRate);
  
  const formattedLongDescription = selectedProduct?.longDescription
    ? selectedProduct.longDescription
        .replace(/\*\*(.*?)\*\*/gs, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
    : '';

  const relatedProducts = selectedProduct
    ? products
        .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
        .slice(0, window.innerWidth < 768 ? 2 : 3)
    : [];

  if (!selectedProduct) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="py-16 text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2 font-display tracking-wider">
              Product Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary-color-darker)] transition"
            >
              Browse Products
            </a>
          </div>
        </main>
        <Footer />
        <MobileNav />
        <Fab />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-6 sm:px-20 lg:px-[110px] pt-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="product-detail-content">
              <div ref={imageContainerRef} className="product-detail-image-container rounded-lg shadow-lg overflow-hidden border">
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"></div>
                )}
                <img
                  src={selectedProduct.image || 'https://via.placeholder.com/400x400.png?text=No+Image'}
                  alt={selectedProduct.name}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
                    isImageLoading ? 'opacity-0' : ''
                  }`}
                />
              </div>
              <div ref={infoContainerRef} className="product-detail-info-container mt-6 md:mt-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="product-detail-title font-bold text-gray-800 font-display tracking-wider">
                    {selectedProduct.name}
                  </h1>
                  {!selectedProduct.stockOut && (
                    <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                      [In Stock]
                    </span>
                  )}
                  {selectedProduct.stockOut && (
                    <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                      [Stock Out]
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-600 preserve-whitespace">
                  {selectedProduct.description}
                </p>
                <div className="mt-6">
                  <span className="text-3xl font-bold text-[var(--primary-color)]">
                    {selectedPriceFormatted}
                  </span>
                </div>
                {(selectedProduct.pricing?.length > 1 || selectedProduct.pricing?.[0]?.duration !== 'Default') && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select an option
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.pricing?.map((pricing: any, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedDurationIndex(index)}
                          className={`relative py-2 px-4 border rounded-md text-sm flex items-center justify-center transition duration-button ${
                            selectedDurationIndex === index
                              ? 'border-[var(--primary-color)] text-[var(--primary-color)] font-bold duration-button-selected'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          <span>{pricing.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-8 flex">
                  <div className="flex w-full flex-row gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 whitespace-nowrap rounded-lg border-2 border-[var(--primary-color)] px-4 sm:px-8 py-3 text-base sm:text-lg font-semibold text-[var(--primary-color)] shadow-md transition-colors hover:bg-[var(--primary-color)] hover:text-white"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={selectedProduct.stockOut}
                      className="flex-1 whitespace-nowrap rounded-lg bg-[var(--primary-color)] px-4 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white shadow-md transition-colors hover:bg-[var(--primary-color-darker)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <div className="flex border-b justify-center">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-3 px-6 font-medium border-b-2 ${
                    activeTab === 'description'
                      ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-3 px-6 font-medium border-b-2 ${
                    activeTab === 'reviews'
                      ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  Reviews
                </button>
              </div>
              <div className="pt-6 tab-content">
                {activeTab === 'description' && (
                  <div className="w-full max-w-4xl mx-auto">
                    <div
                      className={`text-gray-700 leading-relaxed text-justify preserve-whitespace ${
                        !isDescriptionExpanded ? 'line-clamp-4' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: formattedLongDescription }}
                    />
                    {selectedProduct.longDescription && selectedProduct.longDescription.length > 300 && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-[var(--primary-color)] font-bold mt-2"
                      >
                        {!isDescriptionExpanded ? 'See More' : 'See Less'}
                      </button>
                    )}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="w-full max-w-4xl mx-auto">
                    <div
                      onClick={() => setReviewModalOpen(true)}
                      className="flex items-center gap-4 p-2 mb-6 cursor-pointer"
                    >
                      <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                      <div className="flex-1 p-3 bg-gray-100 rounded-xl text-gray-500 font-medium hover:bg-gray-200 transition">
                        Write your review...
                      </div>
                    </div>
                    <div className="space-y-4">
                      {!selectedProduct.reviews || selectedProduct.reviews.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          No reviews yet. Be the first to write one!
                        </p>
                      ) : (
                        selectedProduct.reviews.map((review: any) => (
                          <div key={review.id} className="flex items-start gap-4 py-4 border-b border-gray-200 last:border-b-0">
                            <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-800 font-display tracking-wider">
                                  {review.name}
                                </h4>
                              </div>
                              <div className="flex items-center my-1">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fas fa-star ${
                                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  ></i>
                                ))}
                              </div>
                              <p className="text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {relatedProducts.length > 0 && (
              <div className="mt-16 w-full flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center font-display tracking-wider">
                  Related Products
                </h2>
                <div id="related-products-container" className="inline-grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {relatedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => (window.location.href = `/${product.categorySlug}/${product.slug}`)}
                      className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden transition hover:border-violet-300 flex flex-col cursor-pointer"
                    >
                      <a href={`/${product.categorySlug}/${product.slug}`} className="contents">
                        <div className="product-card-image-container relative">
                          <img
                            src={product.image || 'https://via.placeholder.com/400x300.png?text=No+Image'}
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
                          <h3 className="font-bold text-sm mb-1 line-clamp-1 font-display tracking-wider">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2 preserve-whitespace">
                            {product.description}
                          </p>
                          <p className="font-bold text-base text-[var(--primary-color)] mt-auto">
                            {formatPrice(
                              product.pricing[0]?.price || 0,
                              currency,
                              siteConfig?.usdToBdtRate
                            )}
                          </p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4 font-display tracking-wider">Write a Review</h3>
            <div className="mb-4">
              <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="reviewerName"
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[...Array(5)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setNewReview({ ...newReview, rating: index + 1 })}
                    onMouseEnter={() => setHoverRating(index + 1)}
                    className="text-2xl cursor-pointer transition"
                  >
                    <i
                      className={`fas fa-star ${
                        (hoverRating || newReview.rating) > index ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    ></i>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                id="reviewText"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your thoughts..."
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-6 py-2 bg-[var(--primary-color)] text-white font-semibold rounded-md hover:bg-[var(--primary-color-darker)]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
      <Fab />
    </div>
  );
}