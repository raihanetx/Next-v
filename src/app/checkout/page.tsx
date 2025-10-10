'use client';

import { useEffect, useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';
import { formatPrice, generateOrderId } from '@/lib/helpers';

export default function CheckoutPage() {
  const { 
    products, 
    setProducts, 
    currency, 
    siteConfig, 
    coupons, 
    setCoupons,
    clearCart 
  } = useAppStore();
  
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState(new Map());
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    trx_id: ''
  });
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useRupantorPay, setUseRupantorPay] = useState(false);
  
  const paymentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, couponsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/coupons')
        ]);
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          const map = new Map();
          productsData.forEach((product: any) => {
            map.set(product.id, product);
          });
          setProductsMap(map);
        }
        
        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCoupons(couponsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

    // Load checkout items from localStorage
    const storedItems = localStorage.getItem('checkoutItems');
    if (storedItems) {
      setCheckoutItems(JSON.parse(storedItems));
    }
  }, [products.length, setProducts, setCoupons]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
        setIsPaymentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed RupantorPay script loading due to browser compatibility issues
  // The script uses deprecated navigator APIs causing warnings in modern browsers

  const getProductById = (productId: string) => {
    return productsMap.get(productId);
  };

  const selectPayment = (method: string) => {
    if (method === 'RupantorPay') {
      setUseRupantorPay(true);
      setSelectedPayment(method);
    } else {
      setUseRupantorPay(false);
      setSelectedPayment(method);
    }
    setIsPaymentDropdownOpen(false);
    setCopySuccess(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code.');
      return;
    }

    const codeToApply = couponCode.toUpperCase();
    const foundCoupon = coupons.find(c => c.code === codeToApply && c.isActive);

    if (!foundCoupon) {
      setCouponMessage('The coupon code is invalid or has expired.');
      setAppliedCoupon(null);
      return;
    }

    let isApplicable = false;
    if (!foundCoupon.scope || foundCoupon.scope === 'all_products') {
      isApplicable = checkoutItems.length > 0;
    } else if (foundCoupon.scope === 'category') {
      isApplicable = checkoutItems.some(item => {
        const product = getProductById(item.productId);
        return product && product.category === foundCoupon.scopeValue;
      });
    } else if (foundCoupon.scope === 'single_product') {
      isApplicable = checkoutItems.some(item => item.productId == foundCoupon.scopeValue);
    }

    if (isApplicable) {
      setAppliedCoupon(foundCoupon);
      setCouponMessage(`Coupon "${foundCoupon.code}" applied successfully!`);
    } else {
      setCouponMessage('Coupon is not valid for the items in your cart.');
      setAppliedCoupon(null);
    }
  };

  const calculateTotals = () => {
    const subtotal = checkoutItems.reduce((total, item) => {
      const product = getProductById(item.productId);
      return product ? total + (product.pricing[item.durationIndex]?.price || 0) * item.quantity : total;
    }, 0);

    let discount = 0;
    if (appliedCoupon) {
      let eligibleSubtotal = 0;
      
      if (!appliedCoupon.scope || appliedCoupon.scope === 'all_products') {
        eligibleSubtotal = subtotal;
      } else if (appliedCoupon.scope === 'category') {
        checkoutItems.forEach(item => {
          const product = getProductById(item.productId);
          if (product && product.category === appliedCoupon.scopeValue) {
            eligibleSubtotal += (product.pricing[item.durationIndex]?.price || 0) * item.quantity;
          }
        });
      } else if (appliedCoupon.scope === 'single_product') {
        checkoutItems.forEach(item => {
          if (item.productId == appliedCoupon.scopeValue) {
            const product = getProductById(item.productId);
            eligibleSubtotal += (product.pricing[item.durationIndex]?.price || 0) * item.quantity;
          }
        });
      }
      
      discount = eligibleSubtotal * (appliedCoupon.discountPercentage / 100);
    }

    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount)
    };
  };

  const totals = calculateTotals();

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkoutItems.length === 0) {
      alert('Your checkout is empty!');
      return;
    }

    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.email) {
      alert('Please fill in all billing information.');
      return;
    }

    if (!selectedPayment) {
      alert('Please select a payment method.');
      return;
    }

    // If using RupantorPay, process payment first
    if (useRupantorPay) {
      await processRupantorPayment();
      return;
    }

    // For manual payment, require transaction ID
    if (!paymentForm.trx_id) {
      alert('Please enter the Transaction ID.');
      return;
    }

    await processManualOrder();
  };

  const processRupantorPayment = async () => {
    setIsSubmitting(true);
    
    try {
      const orderId = generateOrderId();
      
      const paymentPayload = {
        fullname: checkoutForm.name,
        email: checkoutForm.email,
        amount: totals.total,
        orderId,
        customerInfo: checkoutForm,
        items: checkoutItems.map(item => {
          const product = getProductById(item.productId);
          return {
            productId: item.productId,
            name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            pricing: product?.pricing[item.durationIndex] || {}
          };
        })
      };

      console.log('Sending payment request with payload:', paymentPayload);
      
      const response = await fetch('/api/rupantorpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Frontend received API response:', result);
        
        // Check for payment URL in both formats (payment_url or paymentUrl)
        const paymentUrl = result.payment_url || result.paymentUrl;
        console.log('Extracted payment URL:', paymentUrl);
        console.log('Response status:', result.status);
        console.log('Status type:', typeof result.status);
        
        // Check for success status (API returns true for success, not 1)
        if ((result.status === true || result.status === 1) && paymentUrl) {
          console.log('Payment URL received:', paymentUrl);
          
          // Due to RupantorPay script compatibility issues with modern browsers,
          // we'll open the payment URL directly in a new tab
          console.log('Opening payment URL directly due to script compatibility issues...');
          
          try {
            // Open in new tab to avoid leaving the current page
            const paymentWindow = window.open(paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            // Check if popup was blocked
            if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
              // Fallback: open in same tab
              console.warn('Popup blocked, opening in same tab');
              window.location.href = paymentUrl;
            } else {
              console.log('Payment window opened successfully');
              // Focus on the payment window
              paymentWindow.focus();
            }
          } catch (error) {
            console.error('Error opening payment window:', error);
            // Final fallback: redirect in same tab
            window.location.href = paymentUrl;
          }
        } else {
          console.error('Payment validation failed:', {
            status: result.status,
            statusType: typeof result.status,
            hasPaymentUrl: !!paymentUrl,
            paymentUrl: paymentUrl
          });
          alert(`Failed to generate payment URL: ${result.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json();
        console.error('API request failed:', errorData);
        alert(`Payment initialization failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('RupantorPay payment error:', error);
      alert('An error occurred while initializing payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed waitForRupantorScript function as we're not using the RupantorPay script anymore

  const processManualOrder = async () => {
    setIsSubmitting(true);

    try {
      const orderId = generateOrderId();
      
      const orderPayload = {
        orderId,
        customerInfo: checkoutForm,
        paymentInfo: {
          method: selectedPayment,
          trx_id: paymentForm.trx_id
        },
        items: checkoutItems.map(item => {
          const product = getProductById(item.productId);
          return {
            id: item.productId,
            name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            pricing: product?.pricing[item.durationIndex] || {}
          };
        }),
        totals,
        coupon: appliedCoupon || null,
        status: 'Pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Clear cart and checkout items
        clearCart();
        localStorage.removeItem('checkoutItems');
        
        // Store order ID for order history
        const savedOrderIds = JSON.parse(localStorage.getItem('orderIds') || '[]');
        savedOrderIds.push(result.orderId);
        localStorage.setItem('orderIds', JSON.stringify(savedOrderIds));
        
        alert('Your order has been placed successfully!');
        window.location.href = '/order-history';
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="py-16 text-center">
            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2 font-display tracking-wider">
              No items to checkout
            </h3>
            <p className="text-gray-500 mb-6">
              Your checkout is empty. Add some items to your cart first.
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
      
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 font-display tracking-wider">
            Secure Checkout
          </h1>
          
          <form onSubmit={placeOrder} id="checkout-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1 order-1 md:order-2">
                <div className="bg-white rounded-lg border-2 p-6 md:sticky md:top-28">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display tracking-wider">
                    Order Summary
                  </h2>
                  <ul>
                    {checkoutItems.map((item, index) => {
                      const product = getProductById(item.productId);
                      if (!product) return null;

                      return (
                        <li
                          key={item.productId}
                          className={`py-3 flex items-center gap-4 ${index > 0 ? 'border-t border-gray-200' : ''}`}
                        >
                          <div className="flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center bg-gray-100 border">
                            <img
                              src={product.image || ''}
                              alt={product.name}
                              className="product-image rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80.png?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800">
                            {formatPrice(
                              (product.pricing[item.durationIndex]?.price || 0) * item.quantity,
                              currency,
                              siteConfig?.usdToBdtRate
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-gray-600 mb-2">
                      <span>Subtotal</span>
                      <span>{formatPrice(totals.subtotal, currency, siteConfig?.usdToBdtRate)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 mb-2 font-semibold">
                        <span>Discount ({appliedCoupon.code} - {appliedCoupon.discountPercentage}%)</span>
                        <span>-{formatPrice(totals.discount, currency, siteConfig?.usdToBdtRate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600 mb-4">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                      <span>Total</span>
                      <span>{formatPrice(totals.total, currency, siteConfig?.usdToBdtRate)}</span>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setAppliedCoupon(null);
                            setCouponMessage('');
                          }}
                          placeholder="ENTER CODE"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
                        >
                          Apply
                        </button>
                      </div>
                      {couponMessage && (
                        <p className={`mt-2 text-sm ${appliedCoupon ? 'text-green-600' : 'text-red-600'}`}>
                          {couponMessage}
                        </p>
                      )}
                    </div>
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-darker)] disabled:opacity-50 hidden md:block"
                    >
                      {isSubmitting ? 'Processing...' : (useRupantorPay ? 'Pay with RupantorPay' : 'Place Order')}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-8 order-2 md:order-1">
                <div className="bg-white rounded-lg border-2 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display tracking-wider">
                    Billing Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border-2 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 font-display tracking-wider">
                    Payment Details
                  </h2>
                  <div className="space-y-4">
                    <div className="relative" ref={paymentDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                        className="w-full flex items-center justify-between text-left px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                      >
                        <span className={selectedPayment ? '' : 'text-gray-500'}>
                          {selectedPayment || 'Select a payment method'}
                        </span>
                        <i
                          className={`fas fa-chevron-down text-gray-400 transition-transform ${
                            isPaymentDropdownOpen ? 'rotate-180' : ''
                          }`}
                        ></i>
                      </button>
                      {isPaymentDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                          <button
                            onClick={() => selectPayment('RupantorPay')}
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left border-b border-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <i className="fas fa-credit-card text-blue-600"></i>
                              <span>Pay Instantly with RupantorPay</span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Recommended</span>
                            </div>
                          </button>
                          <button
                            onClick={() => selectPayment('bKash')}
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                          >
                            bKash (Manual Payment)
                          </button>
                          <button
                            onClick={() => selectPayment('Nagad')}
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                          >
                            Nagad (Manual Payment)
                          </button>
                          <button
                            onClick={() => selectPayment('Binance Pay')}
                            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                          >
                            Binance Pay (Manual Payment)
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {selectedPayment && (
                      <div className="mt-4 space-y-4">
                        {useRupantorPay ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-shield-alt text-blue-600"></i>
                              <h4 className="font-semibold text-blue-800">Secure Payment by RupantorPay</h4>
                            </div>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Pay instantly using multiple payment methods</li>
                              <li>• Supports bKash, Nagad, Rocket, Cards & more</li>
                              <li>• Secure and encrypted payment processing</li>
                              <li>• Instant payment confirmation</li>
                            </ul>
                            <p className="text-xs text-blue-600 mt-2">
                              You will be redirected to RupantorPay's secure payment page to complete your purchase.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-gray-700 font-medium text-base">
                                Please send the total amount to the following{' '}
                                <strong>{selectedPayment}</strong>{' '}
                                <span>{selectedPayment === 'Binance Pay' ? 'Pay ID' : 'number'}:</span>
                              </p>
                              <div className="flex items-center justify-start gap-3 mt-2">
                                <span className="text-base font-medium text-gray-800">
                                  {selectedPayment === 'Binance Pay' ? '1023013318' : '01867892521'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(
                                    selectedPayment === 'Binance Pay' ? '1023013318' : '01867892521'
                                  )}
                                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-md transition ${
                                    copySuccess ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {copySuccess ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 font-display tracking-wider">
                                Instructions
                              </h4>
                              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                {selectedPayment === 'bKash' || selectedPayment === 'Nagad' ? (
                                  <>
                                    <li>Open your {selectedPayment} app and select 'Send Money'.</li>
                                    <li>Enter the number provided above and the total amount.</li>
                                    <li>Complete the transaction and copy the Transaction ID.</li>
                                    <li>Paste the ID in the field below.</li>
                                  </>
                                ) : (
                                  <>
                                    <li>Open your Binance app and select 'Pay'.</li>
                                    <li>Enter the Pay ID provided above and the total amount.</li>
                                    <li>Complete the transaction and copy the Transaction ID.</li>
                                    <li>Paste the ID in the field below.</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {!useRupantorPay && (
                      <div>
                        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          id="transactionId"
                          value={paymentForm.trx_id}
                          onChange={(e) => setPaymentForm({ ...paymentForm, trx_id: e.target.value })}
                          required
                          placeholder="Enter the Transaction ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                      </div>
                    )}
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="save-info" name="save-info" className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                        <label htmlFor="save-info" className="text-sm text-gray-700">
                          Save this information for next time
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="agree-terms" name="agree-terms" required className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                        <label htmlFor="agree-terms" className="text-sm text-gray-700">
                          I agree to the{' '}
                          <a
                            href="/terms-and-conditions"
                            className="font-semibold text-[var(--primary-color)] hover:underline"
                          >
                            Terms and Conditions
                          </a>
                        </label>
                      </div>
                    </div>

                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color-darker)] disabled:opacity-50 block md:hidden"
                    >
                      {isSubmitting ? 'Processing...' : (useRupantorPay ? 'Pay with RupantorPay' : 'Place Order')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <Fab />
    </div>
  );
}