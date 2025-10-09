'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function Fab() {
  const { fabOpen, setFabOpen, siteConfig } = useAppStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      {fabOpen && (
        <div className="flex flex-col items-center space-y-3 mb-3">
          {siteConfig?.contactInfo?.phone && (
            <a
              href={`tel:${siteConfig.contactInfo.phone}`}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[var(--primary-color)] border"
            >
              <i className="fas fa-phone-alt text-xl transform -scale-x-100"></i>
            </a>
          )}
          {siteConfig?.contactInfo?.whatsapp && (
            <a
              href={`https://wa.me/${siteConfig.contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-green-500 border"
            >
              <i className="fab fa-whatsapp text-2xl"></i>
            </a>
          )}
          {siteConfig?.contactInfo?.email && (
            <a
              href={`mailto:${siteConfig.contactInfo.email}`}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-red-500 border"
            >
              <i className="fas fa-envelope text-xl"></i>
            </a>
          )}
        </div>
      )}
      <button
        onClick={() => setFabOpen(!fabOpen)}
        className="flex flex-col items-center text-gray-700"
      >
        <div className="w-14 h-14 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center shadow-lg">
          <i
            className={`fas fa-headset text-2xl fab-icon transition-transform duration-300 ${
              fabOpen ? 'rotate-45' : ''
            }`}
          ></i>
        </div>
        <span className="text-xs font-semibold mt-2">Need Help?</span>
      </button>
    </div>
  );
}