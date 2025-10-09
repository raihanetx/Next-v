'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';
import { formatPrice, formatDate } from '@/lib/helpers';

export default function OrderHistoryPage() {
  const { 
    currency, 
    siteConfig, 
    setOrderHistory, 
    orderHistory, 
    newNotificationCount,
    setNewNotificationCount 
  } = useAppStore();
  
  const [isSearchingOrders, setIsSearchingOrders] = useState(false);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Set up periodic checking for order updates (every 30 seconds)
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const clearNotifications = () => {
    setNewNotificationCount(0);
    const seenOrders: any = {};
    orderHistory.forEach((order: any) => {
      seenOrders[order.orderId] = order.status;
    });
    localStorage.setItem('seenOrders', JSON.stringify(seenOrders));
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const fetchOrders = async () => {
    setIsSearchingOrders(true);
    try {
      const savedOrderIds = JSON.parse(localStorage.getItem('orderIds') || '[]');
      
      if (savedOrderIds.length === 0) {
        setOrderHistory([]);
        setNewNotificationCount(0);
        setIsSearchingOrders(false);
        return;
      }

      const response = await fetch(`/api/orders?ids=${JSON.stringify(savedOrderIds)}`);
      if (response.ok) {
        const orders = await response.json();
        setOrderHistory(orders);
        
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
      console.error('Error fetching orders:', error);
    } finally {
      setIsSearchingOrders(false);
    }
  };

  useEffect(() => {
    clearNotifications();
  }, [orderHistory]);

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrder(openOrder === orderId ? null : orderId);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 font-display tracking-wider">
              Your Order History
            </h1>
            <div className="flex items-center gap-3">
              {newNotificationCount > 0 && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {newNotificationCount} new update{newNotificationCount > 1 ? 's' : ''}
                </div>
              )}
              <button
                onClick={refreshOrders}
                disabled={isSearchingOrders}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-darker)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i className={`fas ${isSearchingOrders ? 'fa-spinner animate-spin' : 'fa-sync-alt'}`}></i>
                Refresh
              </button>
            </div>
          </div>
          
          {orderHistory.length === 0 && !isSearchingOrders ? (
            <div className="py-16 text-center">
              <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2 font-display tracking-wider">
                You have no orders yet
              </h3>
              <p className="text-gray-500 mb-6">
                Looks like you haven't placed any orders. Let's change that!
              </p>
              <a
                href="/products"
                className="inline-block px-8 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary-color-darker)] transition"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <>
              {isSearchingOrders && (
                <div className="text-center py-16">
                  <i className="fas fa-spinner animate-spin text-4xl text-[var(--primary-color)]"></i>
                  <p className="mt-4 text-gray-600">Loading your order history...</p>
                </div>
              )}
              
              {!isSearchingOrders && orderHistory.length > 0 && (
                <div className="space-y-6">
                  {orderHistory.map((order: any) => {
                    const seenOrders = JSON.parse(localStorage.getItem('seenOrders') || '{}');
                    const hasStatusUpdate = !seenOrders[order.orderId] || seenOrders[order.orderId] !== order.status;
                    
                    return (
                      <div key={order.id} className={`bg-white rounded-lg shadow-md overflow-hidden border ${hasStatusUpdate ? 'border-blue-400 border-2' : 'border'}`}>
                        {hasStatusUpdate && (
                          <div className="bg-blue-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                            <i className="fas fa-bell"></i>
                            Status updated to {order.status}
                          </div>
                        )}
                        <div className="p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 font-display tracking-wider flex items-center gap-2">
                              Order #{order.orderId}
                              {hasStatusUpdate && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="mt-4 sm:mt-0 flex items-center gap-4">
                            <span
                              className={`text-sm font-medium px-3 py-1 rounded-full ${
                                order.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </span>
                            <p className="text-xl font-bold text-[var(--primary-color)]">
                              {formatPrice(order.totals.total, currency, siteConfig?.usdToBdtRate)}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="mb-4">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-4 py-2">
                                <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-gray-100 border">
                                  <img
                                    src={`https://via.placeholder.com/50x50.png?text=${encodeURIComponent(item.name.charAt(0))}`}
                                    alt={item.name}
                                    className="product-image rounded-md"
                                  />
                                </div>
                                <p className="font-semibold text-gray-700">{item.name}</p>
                                <p className="ml-auto text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => toggleOrderDetails(order.orderId)}
                            className="text-sm font-semibold text-[var(--primary-color)] hover:underline"
                          >
                            {openOrder !== order.orderId ? 'View Details' : 'Hide Details'}
                          </button>
                          {openOrder === order.orderId && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-semibold text-gray-800 mb-2 font-display tracking-wider">
                                Customer Information
                              </h4>
                              <p className="text-sm text-gray-600">
                                Name: {order.customerInfo.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Email: {order.customerInfo.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                Phone: {order.customerInfo.phone}
                              </p>
                              <p className="text-sm text-gray-600">
                                Transaction ID: {order.paymentInfo.trx_id}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
      <Fab />
    </div>
  );
}