'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransactionVerifier from '@/components/TransactionVerifier';

export default function TestPaymentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            পেমেন্ট ট্রানজেকশন ভেরিফিকেশন টেস্ট
          </h1>
          <p className="text-gray-600">
            এই পেজটি আপনাকে ট্রানজেকশন ভেরিফিকেশন সিস্টেম টেস্ট করতে সাহায্য করবে
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              কিভাবে টেস্ট করবেন
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">১.</span>
                <p>প্রথমে একটি টেস্ট পেমেন্ট করুন RupantorPay এর মাধ্যমে</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">২.</span>
                <p>পেমেন্ট সম্পন্ন হলে, আপনি একটি ট্রানজেকশন ID পাবেন</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">৩.</span>
                <p>সেই ট্রানজেকশন ID টি নিচের ভেরিফায়ারে বসান</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">৪.</span>
                <p>ভেরিফাই বাটনে ক্লিক করে ট্রানজেকশন যাচাই করুন</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">গুরুত্বপূর্ণ তথ্য</h3>
              <p className="text-sm text-yellow-700">
                যেহেতু আমরা localhost এ কাজ করছি, RupantorPay এর সাথে ডোমেইন ম্যাচিং এর সমস্যা হতে পারে। 
                এই ভেরিফায়ার সেই সমস্যা সমাধানে সাহায্য করবে।
              </p>
            </div>
          </div>

          {/* Transaction Verifier */}
          <div>
            <TransactionVerifier 
              onVerified={(data) => {
                console.log('Test transaction verified:', data);
                alert('ট্রানজেকশন সফলভাবে ভেরিফাই হয়েছে!');
              }}
            />
          </div>
        </div>

        {/* Test Transaction IDs */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            টেস্ট ট্রানজেকশন IDs
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-500 mb-1">Valid Format</p>
              <code className="text-sm font-mono">TEST123456</code>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-500 mb-1">Valid Format</p>
              <code className="text-sm font-mono">ABC789DEF</code>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-500 mb-1">Invalid Format</p>
              <code className="text-sm font-mono">123</code>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            উপরের টেস্ট IDs গুলি ব্যবহার করে ভেরিফিকেশন সিস্টেম টেস্ট করতে পারেন
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}