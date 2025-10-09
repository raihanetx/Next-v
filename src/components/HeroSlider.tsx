'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export default function HeroSlider() {
  const { siteConfig } = useAppStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Prepare slides
  const slides = siteConfig?.heroBanner?.length > 0
    ? siteConfig.heroBanner.map((url: string) => ({ url, type: 'image' }))
    : [
        { text: 'Banner 1', bgColor: 'bg-violet-500', type: 'placeholder' },
        { text: 'Banner 2', bgColor: 'bg-indigo-500', type: 'placeholder' },
        { text: 'Banner 3', bgColor: 'bg-sky-500', type: 'placeholder' },
        { text: 'Banner 4', bgColor: 'bg-teal-500', type: 'placeholder' },
      ];

  const sliderInterval = siteConfig?.heroSliderInterval || 5000;

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, sliderInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length, sliderInterval]);

  const handleSlideClick = (index: number) => {
    setActiveSlide(index);
  };

  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  return (
    <section
      className="hero-section aspect-[2/1] md:aspect-[5/2] rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              activeSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.type === 'image' ? (
              <img
                src={slide.url}
                alt={`Promotional Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center h-full w-full ${slide.bgColor}`}
              >
                <span className="text-2xl md:text-4xl font-bold text-white/80 tracking-wider">
                  {slide.text}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideClick(index)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              activeSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}