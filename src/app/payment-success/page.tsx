'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccessRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Build URL with all parameters and redirect to success page
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });
    
    const redirectUrl = `/payment/success?${params.toString()}`;
    console.log('🔄 Redirecting from payment-success to:', redirectUrl);
    
    router.replace(redirectUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to payment confirmation...</p>
      </div>
    </div>
  );
}