'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { cart, orderHistory, newNotificationCount } = useAppStore();
  const pathname = usePathname();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center transition w-full ${
          isActive('/') ? 'text-[var(--primary-color)]' : 'text-gray-500'
        }`}
      >
        <i className="fas fa-home text-2xl"></i>
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link
        href="/products"
        className={`flex flex-col items-center justify-center transition w-full ${
          isActive('/products') ? 'text-[var(--primary-color)]' : 'text-gray-500'
        }`}
      >
        <i className="fas fa-box-open text-2xl"></i>
        <span className="text-xs mt-1">Products</span>
      </Link>
      <Link
        href="/order-history"
        className={`relative flex flex-col items-center justify-center transition w-full ${
          isActive('/order-history') ? 'text-[var(--primary-color)]' : 'text-gray-500'
        }`}
      >
        <div className="relative">
          <i className="fas fa-receipt text-2xl"></i>
          {newNotificationCount > 0 && (
            <span
              className="notification-badge"
              style={{ top: '-2px', right: '-8px' }}
            >
              {newNotificationCount}
            </span>
          )}
        </div>
        <span className="text-xs mt-1">Orders</span>
      </Link>
    </nav>
  );
}