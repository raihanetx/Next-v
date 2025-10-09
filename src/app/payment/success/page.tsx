'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    // Verify the payment with our backend
    if (transactionId) {
      verifyPayment(transactionId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch('/api/rupantorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId })
      });

      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment Status</h1>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying payment...</p>
            </div>
          ) : (
            <>
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

              {verificationResult && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Verification Result</h2>
                  <div className={`rounded-lg p-4 ${
                    verificationResult.success ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <pre className={`text-sm whitespace-pre-wrap ${
                      verificationResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {JSON.stringify(verificationResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <a
                  href="/"
                  className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}