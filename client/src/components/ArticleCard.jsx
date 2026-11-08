import React, { useState } from 'react';
import TrustBadge from './TrustBadge';
import { Bookmark, Clock, Eye, Heart, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { toggleBookmark, toggleLike } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function ArticleCard({ article, onSelectArticle }) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(
    user?.bookmarks ? user.bookmarks.includes(article._id) : false
  );
  const [likes, setLikes] = useState(article.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleBookmark(article._id);
      if (res) {
        setIsBookmarked(res.bookmarked);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (hasLiked) return;
    try {
      const res = await toggleLike(article._id);
      if (res && res.likeCount !== undefined) {
        setLikes(res.likeCount);
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const verifiedClaimsCount = (article.claims || []).filter(
    (c) => (c.status || '').toLowerCase() === 'verified'
  ).length;

  return (
    <article
      onClick={() => onSelectArticle && onSelectArticle(article)}
      className="group relative rounded-2xl bg-white border border-surface-border overflow-hidden flex flex-col justify-between cursor-pointer glass-panel-hover shadow-card-soft"
    >
      {/* Card Header & Cover Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category & Bookmark Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider font-bold bg-white/90 text-teal-800 border border-white/60 shadow-xs backdrop-blur-md">
            {article.category}
          </span>

          <button
            onClick={handleBookmark}
            className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
              isBookmarked
                ? 'bg-teal-600 text-white'
                : 'bg-white/85 text-slate-600 hover:text-slate-900 border border-white/60'
            }`}
            title="Bookmark story"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Trust Badge overlay on cover */}
        <div className="absolute bottom-3 left-3 z-10">
          <TrustBadge trustScore={article.trustScore} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Claim Verification Status Tag */}
          <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1 text-teal-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              {verifiedClaimsCount} of {article.claims?.length || 0} claims verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              {article.readTime}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-textPrimary group-hover:text-teal-700 transition-colors leading-snug line-clamp-2 mb-2">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed mb-4">
            {article.summary}
          </p>
        </div>

        {/* Card Footer: Author + Metrics */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={article.author?.name}
              src={article.author?.avatar}
              className="w-6 h-6 rounded-full border border-slate-200 text-[9px]"
            />
            <span className="text-slate-800 font-bold text-[11px] truncate max-w-[110px]">
              {article.author?.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-rose-600 transition-colors ${
                hasLiked ? 'text-rose-600 font-bold' : ''
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>

            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.viewCount}</span>
            </div>

            <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:text-teal-700 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
