import React, { useState, useEffect } from 'react';
import TrustBadge from './TrustBadge';
import Avatar from './Avatar';
import { ChevronLeft, ChevronRight, Clock, Eye, ArrowUpRight } from 'lucide-react';

export default function HeroCarousel({ articles = [], onSelectArticle }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featured = articles.filter(a => a.isFeatured) || [];
  const activeList = featured.length > 0 ? featured : articles.slice(0, 3);

  useEffect(() => {
    if (activeList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeList.length]);

  if (!activeList.length) return null;

  const current = activeList[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Outer Shell (Double-Bezel architecture in Ivory & Teal) */}
      <div className="double-bezel shadow-sm">
        <div className="double-bezel-inner relative overflow-hidden rounded-[calc(1.25rem-1px)] min-h-[440px] md:min-h-[480px] flex flex-col justify-end">
          
          {/* Background Image with Warm Ivory Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              key={current._id}
              src={current.coverImage}
              alt={current.title}
              className="w-full h-full object-cover opacity-35 scale-105 transition-all duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
          </div>

          {/* Foreground Editorial Content */}
          <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-4xl">
            {/* Meta Strip */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-bold bg-teal-50 text-teal-800 border border-teal-200">
                {current.category}
              </span>

              <TrustBadge trustScore={current.trustScore} />

              <span className="hidden sm:flex items-center gap-1.5 text-xs text-textMuted font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {current.readTime || '4 min read'}
              </span>

              <span className="hidden sm:flex items-center gap-1.5 text-xs text-textMuted font-mono font-medium">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {current.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* Main Headline */}
            <h1
              onClick={() => onSelectArticle && onSelectArticle(current)}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-textPrimary tracking-tight leading-tight mb-4 hover:text-teal-700 cursor-pointer transition-colors"
            >
              {current.title}
            </h1>

            {/* Summary */}
            <p className="text-sm sm:text-base text-slate-600 line-clamp-2 md:line-clamp-3 mb-6 max-w-3xl leading-relaxed">
              {current.summary}
            </p>

            {/* Author Credit & CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border">
              <div className="flex items-center gap-3">
                <Avatar
                  name={current.author?.name}
                  src={current.author?.avatar}
                  className="w-10 h-10 rounded-full border-2 border-teal-100 shadow-xs text-xs"
                />
                <div>
                  <p className="text-xs font-bold text-textPrimary">{current.author?.name}</p>
                  <p className="text-[11px] text-textMuted font-mono">Verified Journalist</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectArticle && onSelectArticle(current)}
                  className="group px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Read Full Investigation</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-xl bg-white/90 border border-surface-border hover:border-teal-400 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-all shadow-xs backdrop-blur-md"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-xl bg-white/90 border border-surface-border hover:border-teal-400 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-all shadow-xs backdrop-blur-md"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Progress Indicators */}
          <div className="absolute bottom-4 right-6 z-20 hidden md:flex items-center gap-1.5">
            {activeList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'w-8 bg-teal-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
