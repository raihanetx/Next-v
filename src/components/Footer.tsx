'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <div>
              <Link href="/" className="inline-block text-2xl font-bold text-slate-100">
                Submonth
              </Link>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                The Digital Product Store
              </p>
            </div>
            <div className="pt-2">
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 w-full min-w-0 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 text-white focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-darker)] text-white font-semibold px-3 sm:px-4 py-2 rounded-md text-sm transition-colors duration-300 flex-shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <nav>
            <div className="overflow-x-auto no-scrollbar pb-2">
              <ul className="inline-flex flex-nowrap items-center whitespace-nowrap gap-x-6 sm:gap-x-8 text-sm text-slate-400">
                <li>
                  <Link
                    href="/"
                    className="hover:text-violet-400 hover:underline"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="hover:text-violet-400 hover:underline"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-violet-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="hover:text-violet-400 hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="hover:text-violet-400 hover:underline"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          <div className="pt-2">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Submonth, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}