'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/helpers';

export default function Header() {
  const {
    currency,
    toggleCurrency,
    cart,
    isSideMenuOpen,
    setIsSideMenuOpen,
    siteConfig,
    categories,
    products,
    orderHistory,
    newNotificationCount,
    setNewNotificationCount,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
        setIsPaymentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global order notification checker
  useEffect(() => {
    const checkOrderUpdates = async () => {
      try {
        const savedOrderIds = JSON.parse(localStorage.getItem('orderIds') || '[]');
        
        if (savedOrderIds.length === 0) return;

        const response = await fetch(`/api/orders?ids=${JSON.stringify(savedOrderIds)}`);
        if (response.ok) {
          const orders = await response.json();
          
          // Calculate notifications based on status changes
          const seenOrders = JSON.parse(localStorage.getItem('seenOrders') || '{}');
          let count = 0;
          
          orders.forEach((order: any) => {
            const lastSeenStatus = seenOrders[order.orderId];
            if (!lastSeenStatus || lastSeenStatus !== order.status) {
              count++;
            }
          });
          
          setNewNotificationCount(count);
        }
      } catch (error) {
        console.error('Error checking order updates:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkOrderUpdates();
    const interval = setInterval(checkOrderUpdates, 30000);
    
    return () => clearInterval(interval);
  }, [setNewNotificationCount]);

  return (
    <>
      {/* Side Menu */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsSideMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50"
          />
          <div className="relative w-72 max-w-xs bg-white h-full shadow-xl p-6">
            <button
              onClick={() => setIsSideMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-8 font-display tracking-wider">
              Menu
            </h2>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-lg text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setIsSideMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about-us"
                className="text-lg text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setIsSideMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/privacy-policy"
                className="text-lg text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setIsSideMenuOpen(false)}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-lg text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setIsSideMenuOpen(false)}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/refund-policy"
                className="text-lg text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setIsSideMenuOpen(false)}
              >
                Refund Policy
              </Link>
            </nav>
            <hr className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4 font-display tracking-wider">
              Categories
            </h3>
            <nav className="flex flex-col space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/category/${category.slug}`}
                  className="text-gray-600 hover:text-[var(--primary-color)]"
                  onClick={() => setIsSideMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header flex justify-between items-center px-4 bg-white shadow-md sticky top-0 z-40 h-16 md:h-20">
        {/* Mobile Header View */}
        <div className="flex items-center justify-between w-full md:hidden gap-2">
          <Link href="/" className="logo flex-shrink-0">
            {siteConfig?.siteLogo ? (
              <img src={siteConfig.siteLogo} alt="Submonth Logo" className="h-8" />
            ) : (
              <img
                src="https://i.postimg.cc/gJRL0cdG/1758261543098.png"
                alt="Submonth Logo"
                className="h-8"
              />
            )}
          </Link>
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 h-9 text-sm"
              aria-label="Search mobile"
            />
            <div className="absolute top-2 bottom-2 right-8 w-px bg-gray-300"></div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              aria-label="Submit search mobile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              </svg>
            </button>
          </form>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCurrency}
              className="icon text-gray-600 hover:text-[var(--primary-color)] cursor-pointer flex items-center gap-1 font-semibold"
            >
              <i className="fas fa-dollar-sign text-xl"></i>
              <span className="text-sm">{currency}</span>
            </button>
            <Link
              href="/cart"
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer relative"
              aria-label="Shopping Cart"
            >
              <i className="fas fa-shopping-bag relative -top-0.5"></i>
              {cartCount > 0 && (
                <span className="notification-badge">{cartCount}</span>
              )}
            </Link>
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer"
              aria-label="Open menu"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Desktop Header View */}
        <div className="hidden md:flex items-center w-full gap-5">
          <Link href="/" className="logo flex-shrink-0 flex items-center text-gray-800 no-underline">
            {siteConfig?.siteLogo ? (
              <img src={siteConfig.siteLogo} alt="Submonth Logo" className="h-9" />
            ) : (
              <img
                src="https://i.postimg.cc/gJRL0cdG/1758261543098.png"
                alt="Submonth Logo"
                className="h-9"
              />
            )}
          </Link>
          <form onSubmit={handleSearch} className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for premium subscriptions, courses, and more..."
              className="w-full py-2.5 px-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors text-gray-900 placeholder-gray-400"
              aria-label="Search"
            />
            <div className="absolute top-2.5 bottom-2.5 right-10 w-px bg-gray-300"></div>
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label="Submit search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </form>
          <div className="flex-shrink-0 flex items-center gap-5">
            <button
              onClick={toggleCurrency}
              className="icon text-xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer flex items-center gap-2 font-semibold"
            >
              <i className="fas fa-dollar-sign text-2xl pt-px"></i>
              <span className="pt-px">{currency}</span>
            </button>
            <Link
              href="/products"
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer"
              aria-label="All Products"
            >
              <i className="fas fa-box-open"></i>
            </Link>
            <Link
              href="/cart"
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer relative"
              aria-label="Shopping Cart"
            >
              <i className="fas fa-shopping-bag relative -top-0.5"></i>
              {cartCount > 0 && (
                <span className="notification-badge">{cartCount}</span>
              )}
            </Link>
            <Link
              href="/order-history"
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer relative"
              aria-label="Order History"
            >
              <i className="fas fa-receipt relative -top-0.5"></i>
              {newNotificationCount > 0 && (
                <span className="notification-badge animate-pulse">{newNotificationCount}</span>
              )}
            </Link>
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="icon text-2xl text-gray-600 hover:text-[var(--primary-color)] cursor-pointer"
              aria-label="Open menu"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}