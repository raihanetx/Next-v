'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-4xl p-6 md:p-12">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center border-b pb-4">
              আমাদের সম্পর্কে (About Us) – Submonth
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Submonth হল একটি উদ্ভাবনী ডিজিটাল প্ল্যাটফর্ম, যেখানে আপনি পেতে পারেন শিক্ষনীয় এবং প্রাত্যহিক জীবনের জন্য গুরুত্বপূর্ণ বিভিন্ন ডিজিটাল পণ্য ও পরিষেবা।
            </p>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">আমরা কী করি:</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li>
                  <strong className="font-semibold">লাইভ কোর্স –</strong> স্কিল ডেভেলপমেন্টের জন্য আমাদের এক্সপার্টদের দ্বারা পরিচালিত লাইভ কোর্স।
                </li>
                <li>
                  <strong className="font-semibold">সাবস্ক্রিপশন সার্ভিস –</strong> ChatGPT Plus, Canva Pro, Envato Elements-এর মতো প্রিমিয়াম সাবস্ক্রিপশন সহজ ও সাশ্রয়ী দামে।
                </li>
                <li>
                  <strong className="font-semibold">সফটওয়্যার –</strong> প্রয়োজনীয় ইউটিলিটি সফটওয়্যার, প্রোডাক্টিভিটি টুলস ইত্যাদি।
                </li>
                <li>
                  <strong className="font-semibold">ইবুক –</strong> ব্যাবসা, মার্কেটিং, ফ্রিল্যান্সিং ও স্কিল ডেভেলপমেন্ট ভিত্তিক ইবুক।
                </li>
                <li>
                  <strong className="font-semibold">টেমপ্লেট –</strong> ডিজাইন, প্রেজেন্টেশন, মার্কেটিং বা সোশ্যাল মিডিয়ার জন্য কাস্টম টেমপ্লেট।
                </li>
              </ul>
            </div>
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">আমাদের মিশন:</h2>
              <p className="text-lg text-gray-700">
                "প্রযুক্তিকে কাজে লাগিয়ে মানুষের জীবন সহজ করা এবং ডিজিটাল বাংলাদেশ গঠনে অবদান রাখা।"
              </p>
            </div>
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">আমাদের লক্ষ্য:</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                <li>সাশ্রয়ী দামে মানসম্পন্ন ডিজিটাল পণ্য</li>
                <li>নতুনদের জন্য সহজ শেখার সুযোগ</li>
                <li>সময়োপযোগী ও নিরাপদ সাপোর্ট সিস্টেম</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <Fab />
    </div>
  );
}