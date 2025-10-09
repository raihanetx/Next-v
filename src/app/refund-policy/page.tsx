'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Fab from '@/components/Fab';
import { useAppStore } from '@/lib/store';

export default function RefundPolicyPage() {
  const { siteConfig } = useAppStore();

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-4xl p-6 md:p-12">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center border-b pb-4">
              Refund Policy
            </h1>
            <p className="text-center text-gray-600">
              আমরা গ্রাহক সন্তুষ্টিকে সর্বোচ্চ গুরুত্ব দিই। তবে আমাদের পণ্য ডিজিটাল হওয়ায় রিফান্ড নীতির জন্য নির্দিষ্ট নিয়ম রয়েছে:
            </p>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">১. ফেরতযোগ্য পণ্য:</h2>
                <p className="text-gray-700">
                  যদি আপনি ভুল ডিজিটাল পণ্য পান বা লিংকে প্রবেশ করতে না পারেন এবং আমাদের সাপোর্ট টিম আপনার সমস্যার সমাধান ৭২ ঘন্টার মধ্যে করতে ব্যর্থ হয়, তাহলে আপনি সম্পূর্ণ রিফান্ডের জন্য আবেদন করতে পারেন।
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">২. ফেরতযোগ্য নয় এমন পণ্য:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    আপনি যদি ইবুক সফলভাবে ডাউনলোড করে ফেলেন, লাইভ কোর্সে অংশগ্রহণ করেন বা কোনো সফটওয়্যার একটিভ করেন, তাহলে সেই পণ্যটি ফেরতযোগ্য বলে গণ্য হবে না।
                  </li>
                  <li>
                    যেকোনো সাবস্ক্রিপশন চালু হওয়ার পর তা বাতিল করে রিফান্ড চাওয়া যাবে না।
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">৩. রিফান্ড প্রসেস:</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                  <li>
                    রিফান্ডের জন্য আপনাকে আমাদের অফিসিয়াল WhatsApp নম্বরে যোগাযোগ করতে হবে:{' '}
                    {siteConfig?.contactInfo?.whatsapp && (
                      <a
                        href={`https://wa.me/${siteConfig.contactInfo.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary-color)] font-semibold hover:underline"
                      >
                        +{siteConfig.contactInfo.phone}
                      </a>
                    )}
                  </li>
                  <li>
                    আপনার আবেদন রিভিউ করে ২-৩ কার্যদিবসের মধ্যে আপনার টাকা পেমেন্টকৃত মাধ্যমে ফেরত পাঠানো হবে।
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