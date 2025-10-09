'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const transactionId = searchParams.get('transactionId'); // Note: capital I in documentation
    const paymentMethod = searchParams.get('paymentMethod');
    const paymentAmount = searchParams.get('paymentAmount');
    const paymentFee = searchParams.get('paymentFee');
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');

    const paymentInfo = {
      transactionId,
      paymentMethod,
      paymentAmount,
      paymentFee,
      currency,
      status
    };

    setPaymentData(paymentInfo);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Cancelled</h1>
          
          <div className="text-center py-8">
            <div className="text-red-600 text-6xl mb-4">
              <i className="fas fa-times-circle"></i>
            </div>
            <p className="text-xl text-gray-700 mb-2">
              Your payment has been cancelled.
            </p>
            <p className="text-gray-600 mb-6">
              You can try again or contact support if you need assistance.
            </p>
          </div>

          {paymentData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(paymentData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 text-center space-x-4">
            <a
              href="/checkout"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </a>
            <a
              href="/"
              className="inline-block bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}