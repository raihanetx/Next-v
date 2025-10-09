'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';

export default function CartPage() {
  const { 
    cart, 
    products, 
    setProducts, 
    currency, 
    siteConfig, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart 
  } = useAppStore();
  
  const [productsMap, setProductsMap] = useState(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          const map = new Map();
          data.forEach((product: any) => {
            map.set(product.id, product);
          });
          setProductsMap(map);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (products.length === 0) {
      fetchData();
    } else {
      const map = new Map();
      products.forEach((product: any) => {
        map.set(product.id, product);
      });
      setProductsMap(map);
    }
  }, [products.length, setProducts]);

  const getProductById = (productId: string) => {
    return productsMap.get(productId);
  };

  const cartTotal = cart.reduce((total, item) => {
    const product = getProductById(item.productId);
    if (product) {
      return total + (product.pricing[item.durationIndex]?.price || 0) * item.quantity;
    }
    return total;
  }, 0);

  const isCartCheckoutable = cart.some(item => {
    const product = getProductById(item.productId);
    return product && !product.stockOut;
  });

  const handleCheckout = () => {
    const inStockItems = cart.filter(item => {
      const product = getProductById(item.productId);
      return product && !product.stockOut;
    });

    if (inStockItems.length === 0) {
      alert('All items in your cart are out of stock.');
      return;
    }

    const outOfStockCount = cart.length - inStockItems.length;
    if (outOfStockCount > 0) {
      alert(`${outOfStockCount} item(s) are out of stock and will be excluded from this order.`);
    }

    // Store checkout items and redirect
    localStorage.setItem('checkoutItems', JSON.stringify(inStockItems));
    window.location.href = '/checkout';
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 font-display tracking-wider">
            Shopping Cart
          </h1>
          
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2 font-display tracking-wider">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary-color-darker)] transition"
              >
                Browse Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white rounded-lg border-2 p-4">
                <ul>
                  {cart.map((cartItem, index) => {
                    const product = getProductById(cartItem.productId);
                    if (!product) return null;

                    return (
                      <li
                        key={cartItem.productId}
                        className={`py-6 flex items-start gap-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}
                      >
                        <div className="flex-shrink-0 w-24 h-24 rounded-md flex items-center justify-center bg-gray-100 border">
                          <img
                            src={product.image || ''}
                            alt={product.name}
                            className="product-image rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100.png?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-lg font-semibold text-gray-800 font-display tracking-wider">
                                {product.name}
                              </h3>
                              <p className="text-lg font-bold text-[var(--primary-color)]">
                                {formatPrice(
                                  (product.pricing[cartItem.durationIndex]?.price || 0) * cartItem.quantity,
                                  currency,
                                  siteConfig?.usdToBdtRate
                                )}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Duration: {product.pricing[cartItem.durationIndex]?.duration || 'Default'}
                            </p>
                            {product.stockOut && (
                              <p className="text-red-600 text-xs mt-2 font-semibold">
                                This item is out of stock and will be excluded from checkout.
                              </p>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => updateCartQuantity(cartItem.productId, -1)}
                                disabled={cartItem.quantity <= 1}
                                className="px-3 py-1 text-gray-600 disabled:opacity-50"
                              >
                                <i className="fas fa-minus text-xs"></i>
                              </button>
                              <span className="px-4 py-1 border-l border-r">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(cartItem.productId, 1)}
                                disabled={product.stockOut}
                                className="px-3 py-1 text-gray-600 disabled:opacity-50"
                              >
                                <i className="fas fa-plus text-xs"></i>
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(cartItem.productId)}
                              className="font-medium text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                              <i className="fas fa-trash-alt"></i> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border-2 p-6 sticky top-28">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display tracking-wider">
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal, currency, siteConfig?.usdToBdtRate)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="pt-4 border-t flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal, currency, siteConfig?.usdToBdtRate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!isCartCheckoutable}
                    className="w-full mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-darker)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
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