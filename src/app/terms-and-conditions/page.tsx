'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-4xl p-6 md:p-12">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center border-b pb-4">
              Terms and Conditions
            </h1>
            <p className="text-center text-gray-600">
              এই শর্তাবলীতে আপনাকে স্বাগতম। Submonth পরিচালিত ওয়েবসাইট, পণ্য এবং পরিষেবাগুলোর ব্যবহার করার পূর্বে নিচের শর্তগুলো মনোযোগসহকারে পড়ে নিন।
            </p>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">১. পরিষেবার গ্রহণযোগ্যতা:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনি যদি ১৮ বছর বা তদূর্ধ্ধ হন বা আপনার অভিভাবকের অনুমতি নিয়ে ওয়েবসাইটটি ব্যবহার করেন, তাহলেই আপনি আমাদের পরিষেবা গ্রহণ করতে পারবেন।
                  </li>
                  <li>
                    আমাদের কোনো কোর্স, ইবুক, সফটওয়্যার, বা টেমপ্লেট অবৈধ বা অননুমোদিত কাজে ব্যবহার করা যাবে না।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">২. ডিজিটাল পণ্যের মালিকানা:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনি Submonth-এর কাছ থেকে কোনো পণ্য ক্রয়ের মাধ্যমে সেটির কপিরাইট বা মালিকানা লাভ করছেন না।
                  </li>
                  <li>
                    প্রতিটি পণ্য বা কোর্স শুধুমাত্র আপনার ব্যক্তিগত ব্যবহারের জন্য বরাদ্দ, তা অন্য কারো সাথে শেয়ার, বিক্রি বা বিতরণ করা যাবে না।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৩. পেমেন্ট ও অর্ডার প্রসেস:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনি আমাদের ওয়েবসাইটে পেমেন্ট সম্পন্ন করার পর সংশ্লিষ্ট পণ্য বা সেবার লিংক বা এক্সেস তথ্য ইমেইলের মাধ্যমে বা অ্যাকাউন্টে সরবরাহ করা হবে।
                  </li>
                  <li>
                    কোনো কারণে যদি পণ্য সরবরাহে বিলম্ব হয়, আমরা যথাযথভাবে আপনাকে অবহিত করবো।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৪. আচরণবিধি:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    Submonth-এর কোর্স বা লাইভ সেশনে কোনো প্রকার অপমানজনক ভাষা, হেনস্তা, বা অবাঞ্চিত আচরণ গ্রহণযোগ্য নয়।
                  </li>
                  <li>
                    যেকোনো সন্দেহজনক বা অসৎ আচরণের জন্য আপনার অ্যাক্সেস সাময়িক বা স্থায়ীভাবে বাতিল করা হতে পারে।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৫. পরিবর্তন ও আপডেট:</h2>
                <p className="text-gray-700">
                  Submonth যে কোনো সময় এই শর্তাবলী পরিবর্তন বা আপডেট করার অধিকার রাখে। নতুন শর্তাবলী আমাদের ওয়েবসাইটে প্রকাশের মাধ্যমে কার্যকর হবে।
                </p>
              </div>
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