'use client';

import { useState } from 'react';

export default function TestRupantorPayPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testPayment = async () => {
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const paymentPayload = {
        fullname: 'John Doe',
        email: 'john@example.com',
        amount: 10,
        orderId: 'TEST-' + Date.now(),
        customerInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '01234567890'
        },
        items: [{
          productId: 'test-product',
          name: 'Test Product',
          quantity: 1,
          pricing: { price: 10, currency: 'USD' }
        }]
      };

      console.log('Testing payment with payload:', paymentPayload);
      
      const response = await fetch('/api/rupantorpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Payment creation failed');
      }
    } catch (error: any) {
      console.error('Test payment error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">RupantorPay Integration Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Payment Creation</h2>
          <p className="text-gray-600 mb-4">
            This will test the RupantorPay API integration with the provided credentials.
          </p>
          
          <button
            onClick={testPayment}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? 'Testing...' : 'Test Payment Creation'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-semibold mb-2">Success</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
            {result.payment_url && (
              <div className="mt-4">
                <a
                  href={result.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  Open Payment URL
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">API Configuration</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>API Key:</strong> MEg5dK0kih7ERNCo0zjZqHNuD58oXWTtnVNGyA8DDN34rrFZx5</li>
            <li><strong>Base URL:</strong> https://payment.rupantorpay.com/api/payment</li>
            <li><strong>Endpoint:</strong> /checkout</li>
            <li><strong>X-CLIENT:</strong> localhost</li>
          </ul>
        </div>
      </div>
    </div>
  );
}