'use client';

import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface TransactionVerifierProps {
  onVerified?: (transactionData: any) => void;
}

export default function TransactionVerifier({ onVerified }: TransactionVerifierProps) {
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleVerify = async () => {
    if (!transactionId.trim()) {
      setResult({
        success: false,
        message: 'অনুগ্রহ করে ট্রানজেকশন আইডি লিখুন'
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          orderId: orderId.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'ট্রানজেকশন সফলভাবে ভেরিফাই হয়েছে',
          data: data.transaction
        });
        onVerified?.(data.transaction);
      } else {
        setResult({
          success: false,
          message: data.error || data.message || 'ট্রানজেকশন ভেরিফিকেশন ব্যর্থ হয়েছে'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        success: false,
        message: 'সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">ট্রানজেকশন ভেরিফাই করুন</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        যদি আপনার ট্রানজেকশন আইডি ভেরিফিকেশনে সমস্যা হয়, নিচে আপনার ট্রানজেকশন আইডি দিয়ে ভেরিফাই করুন
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ট্রানজেকশন আইডি *
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="আপনার ট্রানজেকশন আইডি লিখুন"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            অর্ডার আইডি (ঐচ্ছিক)
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="অর্ডার আইডি লিখুন (যদি থাকে)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying || !transactionId.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ভেরিফাই হচ্ছে...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              ট্রানজেকশন ভেরিফাই করুন
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              
              {result.data && (
                <div className="mt-2 text-xs text-green-700">
                  <p>ট্রানজেকশন স্ট্যাটাস: {result.data.status || 'N/A'}</p>
                  <p>পরিমাণ: {result.data.amount || 'N/A'} ৳</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>সাহায্য:</strong> যদি ট্রানজেকশন ভেরিফিকেশন ব্যর্থ হয়, এটি হতে পারে ডোমেইন ম্যাচিং এর সমস্যার কারণে। 
          অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন অথবা সাপোর্টে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}