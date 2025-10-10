'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentCancelledRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Build URL with all parameters and redirect to cancel page
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });
    
    const redirectUrl = `/payment/cancel?${params.toString()}`;
    console.log('🔄 Redirecting from payment-cancelled to:', redirectUrl);
    
    router.replace(redirectUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to payment cancellation...</p>
      </div>
    </div>
  );
}

export default function PaymentCancelledRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelledRedirectContent />
    </Suspense>
  );
}