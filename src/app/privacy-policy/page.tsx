'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-4xl p-6 md:p-12">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center border-b pb-4">
              Privacy Policy
            </h1>
            <p className="text-center text-gray-600">
              Submonth-এ আমরা আপনার গোপনীয়তাকে অত্যন্ত গুরুত্ব দিয়ে থাকি। আমাদের কাছে আপনি যেসব তথ্য প্রদান করেন, তা নিরাপদ রাখার জন্য আমরা প্রতিশ্রুতিবদ্ধ।
            </p>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">১. আমরা যেসব তথ্য সংগ্রহ করি:</h2>
                <p className="text-gray-700">
                  আপনার অর্ডার প্রসেস এবং উন্নত সেবা প্রদানের জন্য আমরা সাধারণত নিম্নলিখিত তথ্য সংগ্রহ করি: নাম, ইমেইল, ফোন নম্বর এবং পেমেন্ট তথ্য।
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">২. তথ্যের ব্যবহার:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনার অর্ডার সম্পাদন করা, পণ্যের এক্সেস প্রদান, এবং কাস্টমার সাপোর্টে সহায়তা করার জন্য।
                  </li>
                  <li>
                    আপনার সম্মতিতে আপনাকে আমাদের নতুন অফার, নতুন পণ্য ও বিভিন্ন আপডেট পাঠানোর জন্য।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৩. তৃতীয় পক্ষের সাথে তথ্য ভাগাভাগি:</h2>
                <p className="text-gray-700">
                  আমরা আপনার কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে বিক্রি বা শেয়ার করি না। তবে, নির্দিষ্ট প্রযুক্তিগত (যেমন পেমেন্ট গেটওয়ে) এবং আইনি পরিস্থিতিতে সীমাবদ্ধ তথ্য শেয়ার করা বাধ্যতামূলক হতে পারে।
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৪. তথ্য সুরক্ষা:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনার তথ্য সুরক্ষিত রাখতে আমরা আধুনিক এনক্রিপশন প্রযুক্তি ও সুরক্ষিত সার্ভার ব্যবহার করি।
                  </li>
                  <li>
                    আপনি যেকোনো সময় আপনার তথ্য সংশোধন বা আমাদের ডেটাবেস থেকে মুছে ফেলার জন্য অনুরোধ করতে পারেন।
                  </li>
                </ul>
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