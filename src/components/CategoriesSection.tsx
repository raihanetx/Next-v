'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function CategoriesSection() {
  const { categories } = useAppStore();
  const categoryScrollerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: number) => {
    const scroller = categoryScrollerRef.current;
    if (!scroller) return;

    const icons = Array.from(scroller.querySelectorAll('.category-icon'));
    if (icons.length === 0) return;

    const containerRect = scroller.getBoundingClientRect();
    let firstVisibleIndex = icons.findIndex((icon) => {
      const iconRect = icon.getBoundingClientRect();
      return iconRect.right > containerRect.left + 1;
    });

    if (firstVisibleIndex === -1) firstVisibleIndex = 0;

    let targetIndex;
    if (direction > 0) {
      targetIndex = Math.min(firstVisibleIndex + 1, icons.length - 1);
    } else {
      targetIndex = Math.max(firstVisibleIndex - 1, 0);
    }

    icons[targetIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  const setCategoryScrollerWidth = () => {
    const wrapper = categoryScrollerRef.current?.parentElement;
    if (!wrapper) return;

    if (window.innerWidth < 768) {
      (wrapper as HTMLElement).style.maxWidth = '';
      return;
    }

    const scroller = categoryScrollerRef.current;
    const firstIcon = scroller?.querySelector('.category-icon');
    const container = scroller?.querySelector('.category-scroll-container');

    if (firstIcon && container) {
      const gap = parseFloat(window.getComputedStyle(container).gap);
      const iconWidth = (firstIcon as HTMLElement).offsetWidth;
      const totalWidth = iconWidth * 6 + gap * 5;
      (wrapper as HTMLElement).style.maxWidth = `${totalWidth}px`;
    }
  };

  useEffect(() => {
    setCategoryScrollerWidth();
    const handleResize = () => setCategoryScrollerWidth();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="text-center mt-6 mb-6 md:mt-8 md:mb-8">
        <h2 className="text-2xl font-bold text-gray-800 font-display tracking-wider">
          Product Categories
        </h2>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-center gap-2 md:px-0">
          <button
            onClick={() => scrollCategories(-1)}
            className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center"
            aria-label="Scroll categories left"
          >
            <i className="fas fa-chevron-left text-2xl text-gray-500 hover:text-[var(--primary-color)] transition-colors"></i>
          </button>
          <div className="overflow-hidden">
            <div
              ref={categoryScrollerRef}
              className="horizontal-scroll smooth-scroll"
            >
              <div className="category-scroll-container">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products/category/${category.slug}`}
                    className="category-icon"
                  >
                    <i className={category.icon}></i>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => scrollCategories(1)}
            className="hidden md:flex p-2 flex-shrink-0 z-10 items-center justify-center"
            aria-label="Scroll categories right"
          >
            <i className="fas fa-chevron-right text-2xl text-gray-500 hover:text-[var(--primary-color)] transition-colors"></i>
          </button>
        </div>
      </div>
    </section>
  );
}