import React from 'react';
import ArticleCard from './ArticleCard';
import { Sparkles, FileQuestion } from 'lucide-react';

export default function ArticleGrid({ articles = [], loading, onSelectArticle, activeCategory, searchQuery }) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-white border border-surface-border p-4 h-96 animate-pulse flex flex-col justify-between shadow-xs"
            >
              <div className="w-full h-44 bg-slate-100 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-white border border-surface-border shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4 text-teal-700">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-textPrimary mb-2">No Matching Stories Found</h3>
          <p className="text-xs text-textSecondary leading-relaxed">
            No verified articles match your search criteria for "{searchQuery}" in category "{activeCategory}".
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Grid Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-textPrimary flex items-center gap-2">
            <span>Verified Dispatches</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
              {articles.length}
            </span>
          </h3>
          <p className="text-xs text-textMuted mt-1">
            Real-time multi-source fact-checked reports
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">AI PROVENANCE ACTIVE</span>
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article._id}
            article={article}
            onSelectArticle={onSelectArticle}
          />
        ))}
      </div>
    </section>
  );
}
