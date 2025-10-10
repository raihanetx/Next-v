'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, Home } from 'lucide-react';
import TransactionVerifier from '@/components/TransactionVerifier';

export default function PaymentCancelPage() {
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifier, setShowVerifier] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const processPaymentCancel = () => {
      try {
        // Get payment details from URL parameters
        const transactionId = searchParams.get('transaction_id');
        const orderId = searchParams.get('order_id');
        const amount = searchParams.get('amount');
        const fullname = searchParams.get('fullname') || 'Customer';

        // Set payment details from URL parameters
        setPaymentDetails({
          transaction_id: transactionId || 'N/A',
          order_id: orderId || 'N/A',
          amount: amount || '0.00',
          fullname: fullname
        });
      } catch (error) {
        console.error('Error processing payment cancel:', error);
      } finally {
        setLoading(false);
      }
    };

    processPaymentCancel();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing cancellation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          
          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            পেমেন্টটি ক্যান্সেল করা হয়েছে
          </h1>
          <p className="text-gray-600 mb-6">
            আপনার পেমেন্টটি সফলভাবে ক্যান্সেল করা হয়েছে
          </p>

          {/* Order Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">অর্ডার বিবরণ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">অর্ডার আইডি:</span>
                  <span className="font-medium">{paymentDetails.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ট্রানজেকশন আইডি:</span>
                  <span className="font-medium">{paymentDetails.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পরিমাণ:</span>
                  <span className="font-medium">৳{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">গ্রাহক:</span>
                  <span className="font-medium">{paymentDetails.fullname}</span>
                </div>
              </div>
            </div>
          )}

          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            ব্যাক টু হোম
          </button>

          {/* Transaction Verification Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowVerifier(!showVerifier)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {showVerifier ? 'ভেরিফায়ার লুকান' : 'ট্রানজেকশন ভেরিফাই করতে সমস্যা?'}
            </button>
            
            {showVerifier && (
              <div className="mt-4">
                <TransactionVerifier 
                  onVerified={(data) => {
                    console.log('Transaction verified:', data);
                    // ভেরিফিকেশন সফল হলে পেমেন্ট ডিটেইলস আপডেট করা যেতে পারে
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}