import React, { useState, useEffect, useRef } from 'react';
import TrustBadge from './TrustBadge';
import Avatar from './Avatar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { fetchArticle, fetchComments, postComment, flagComment, toggleLike, toggleBookmark } from '../services/api';
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Send,
  Flag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

export default function ArticleDetailView({ articleId, onBack, onSelectCategory }) {
  const { socket } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showClaimsTree, setShowClaimsTree] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Active hover tooltip for inline claims
  const [activeTooltip, setActiveTooltip] = useState(null); // { claim, x, y }
  const commentsSectionRef = useRef(null);

  useEffect(() => {
    if (!articleId) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([fetchArticle(articleId), fetchComments(articleId)])
      .then(([artData, commData]) => {
        if (!isMounted) return;
        setArticle(artData);
        setLikes(artData.likeCount || 0);
        setIsBookmarked(artData.isBookmarked || false);
        setComments(commData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load article:', err);
        setLoading(false);
      });

    // Socket.io room join
    if (socket) {
      socket.emit('article:join', articleId);

      const handleNewComment = (comment) => {
        setComments((prev) => [comment, ...prev.filter((c) => c._id !== comment._id)]);
      };

      const handleModeratedComment = ({ commentId }) => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      };

      const handleLikeUpdate = ({ articleId: targetId, likes: newCount }) => {
        if (targetId === articleId) {
          setLikes(newCount);
        }
      };

      const handleArticleUpdate = (updatedArticle) => {
        if (updatedArticle._id === articleId) {
          setArticle(updatedArticle);
        }
      };

      socket.on('comment:new', handleNewComment);
      socket.on('comment:moderated', handleModeratedComment);
      socket.on('article:like', handleLikeUpdate);
      socket.on('article:update', handleArticleUpdate);

      return () => {
        socket.emit('article:leave', articleId);
        socket.off('comment:new', handleNewComment);
        socket.off('comment:moderated', handleModeratedComment);
        socket.off('article:like', handleLikeUpdate);
        socket.off('article:update', handleArticleUpdate);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [articleId, socket]);

  // Handle inline claim click / hover listeners with mobile touch support
  useEffect(() => {
    if (!article || !article.claims) return;

    const handleClaimInteraction = (target) => {
      const claimId = target.getAttribute('data-claim-id');
      const matched = article.claims.find((c) => c.claimId === claimId);
      if (matched) {
        const rect = target.getBoundingClientRect();
        setActiveTooltip({
          claim: matched,
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 8
        });
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('.claim-highlight');
      if (target) {
        handleClaimInteraction(target);
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('.claim-highlight')) {
        setTimeout(() => {
          if (window.innerWidth >= 640) {
            setActiveTooltip(null);
          }
        }, 1200);
      }
    };

    const handleClick = (e) => {
      const target = e.target.closest('.claim-highlight');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        handleClaimInteraction(target);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
    };
  }, [article]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;

    setCommentError('');
    setIsPosting(true);

    try {
      const created = await postComment(articleId, newComment.trim());
      setComments((prev) => [created, ...prev.filter((c) => c._id !== created._id)]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.message || 'Failed to submit comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleFlagComment = async (commentId) => {
    try {
      await flagComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, flagCount: (c.flagCount || 0) + 1 } : c))
      );
    } catch (err) {
      console.error('Failed to flag comment:', err);
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await toggleLike(articleId);
      if (res && res.likeCount !== undefined) {
        setLikes(res.likeCount);
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await toggleBookmark(articleId);
      if (res) {
        setIsBookmarked(res.bookmarked);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const scrollToComments = () => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-slate-500 font-semibold">Loading AI-verified investigation...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold font-mono"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      
      {/* Desktop Floating Tooltip for Inline Claims */}
      {activeTooltip && (
        <div
          style={{
            position: 'absolute',
            top: `${activeTooltip.y}px`,
            left: `${Math.max(16, Math.min(activeTooltip.x, window.innerWidth - 350))}px`
          }}
          className="hidden sm:block z-50 w-80 p-4 rounded-2xl bg-white border border-teal-200 shadow-2xl animate-fade-in text-xs"
        >
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Claim Verification
            </span>
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                activeTooltip.claim.status === 'Verified'
                  ? 'bg-teal-50 text-teal-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {activeTooltip.claim.status} ({activeTooltip.claim.confidence}%)
            </span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed mb-2.5">
            "{activeTooltip.claim.claimText}"
          </p>
          {activeTooltip.claim.sources && activeTooltip.claim.sources.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-slate-400 mb-1">Indexed Evidence:</p>
              <div className="space-y-1">
                {activeTooltip.claim.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-teal-700 hover:text-teal-900 bg-slate-50 hover:bg-teal-50/60 p-1.5 rounded border border-slate-200 transition-colors"
                  >
                    <span className="truncate">{src.name}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Touch Bottom Sheet for Inline Claims */}
      {activeTooltip && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setActiveTooltip(null)}
        >
          <div
            className="w-full bg-white rounded-2xl border border-teal-200 p-5 shadow-2xl space-y-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Claim Verification
                </span>
                <span
                  className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    activeTooltip.claim.status === 'Verified'
                      ? 'bg-teal-50 text-teal-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {activeTooltip.claim.status} ({activeTooltip.claim.confidence}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTooltip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close claim details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-800 text-xs font-semibold leading-relaxed">
              "{activeTooltip.claim.claimText}"
            </p>
            {activeTooltip.claim.sources && activeTooltip.claim.sources.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-mono text-slate-400 mb-1.5">Indexed Evidence Citations:</p>
                <div className="space-y-1.5">
                  {activeTooltip.claim.sources.map((src, sIdx) => (
                    <a
                      key={sIdx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-teal-700 bg-teal-50/50 p-2 rounded-xl border border-teal-100 font-medium"
                    >
                      <span className="truncate">{src.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation Strip */}
      <div className="flex items-center justify-between gap-4 mb-6 text-xs font-mono text-slate-500">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <span>Feed</span>
          <span>/</span>
          <span
            onClick={() => onSelectCategory && onSelectCategory(article.category)}
            className="text-teal-700 hover:underline cursor-pointer font-bold"
          >
            {article.category}
          </span>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px]">{article.slug}</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 md:p-12 shadow-card-soft mb-8">
        {/* Category & Trust Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {article.category}
          </span>
          <TrustBadge trustScore={article.trustScore} />
          <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {article.readTime}
          </span>
          <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {article.viewCount.toLocaleString()} views
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-textPrimary tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Excerpt / Summary Lead */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-serif italic mb-8 border-l-3 border-teal-600 pl-4">
          {article.summary}
        </p>

        {/* Author Bio Strip & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-surface-border">
          <div className="flex items-center gap-3.5">
            <Avatar
              name={article.author?.name}
              src={article.author?.avatar}
              className="w-12 h-12 rounded-full border-2 border-teal-100 shadow-xs text-sm"
            />
            <div>
              <p className="text-sm font-bold text-textPrimary">{article.author?.name}</p>
              <p className="text-xs text-slate-500 font-mono">
                Published {new Date(article.createdAt).toLocaleDateString()} • Verified Editorial Board
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                hasLiked
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-700 hover:text-rose-600 border-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isBookmarked
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:text-teal-700 border-slate-200'
              }`}
              title="Bookmark story"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={scrollToComments}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-xs font-mono font-bold transition-all"
            >
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>{comments.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact Hero Cover */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-card-soft mb-8 sm:mb-10 bg-slate-100 border border-surface-border">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* AI Fact-Check Verification Banner (DESIGN View 2) */}
      <div className="mb-8 sm:mb-10 rounded-2xl bg-white border border-teal-200 p-4 sm:p-8 shadow-card-soft">
        <div
          onClick={() => setShowClaimsTree(!showClaimsTree)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <TrustBadge trustScore={article.trustScore} size="lg" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 hover:text-teal-900">
            <span>{showClaimsTree ? 'Collapse Fact-Check Tree' : 'Expand Full Claim Breakdown'}</span>
            {showClaimsTree ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* Expandable Claim Verification Tree */}
        {showClaimsTree && article.claims && article.claims.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Extracted Claims & Resolvable Citations ({article.claims.length}):</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Hover highlighted claims in text below for inline citations
              </span>
            </div>

            <div className="space-y-3">
              {article.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                        #{idx + 1}
                      </span>
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                          claim.status === 'Verified'
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : claim.status === 'Needs Context'
                            ? 'bg-sky-50 border-sky-200 text-sky-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {claim.status} ({claim.confidence}% Conf.)
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-800 font-semibold mb-2.5 leading-relaxed">
                    "{claim.claimText}"
                  </p>

                  {/* Sources */}
                  {claim.sources && claim.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        Primary Source Links:
                      </span>
                      {claim.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 px-2 py-0.5 rounded border border-slate-200 font-medium transition-colors"
                        >
                          <span>{src.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reading Body with Highlighted Claims */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 md:p-12 shadow-card-soft mb-12">
        <div
          className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base sm:text-lg space-y-6"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-8 mt-8 border-t border-surface-border">
            <span className="text-xs font-mono text-slate-500 font-semibold">Indexed Tags:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Socket.io Comment Feed (DESIGN View 2) */}
      <div
        ref={commentsSectionRef}
        className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-card-soft space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-textPrimary">Live Discussion Feed</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
              {comments.length}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            Socket.io Stream Active
          </span>
        </div>

        {/* Comment Posting Box */}
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isAuthenticated
                ? `Join the discussion as ${user.name}...`
                : 'Sign in to post comments (Throttled to 1 msg / 3 sec)'
            }
            rows={3}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />

          {commentError && (
            <p className="text-xs text-rose-600 font-mono font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {commentError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-mono text-slate-500">
              Guardrail: 3-second anti-spam throttle • Auto-moderation on 3 flags
            </span>
            <button
              type="submit"
              disabled={isPosting || !newComment.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPosting ? 'Broadcasting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-8 text-center">
              No comments yet. Be the first to start the discussion!
            </p>
          ) : (
            comments.map((comm) => (
              <div
                key={comm._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={comm.author?.name}
                    src={comm.author?.avatar}
                    className="w-8 h-8 rounded-full border border-slate-200 mt-0.5 text-[10px]"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {comm.author?.name || 'Anonymous Reader'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(comm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {comm.content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleFlagComment(comm._id)}
                  className="text-slate-400 hover:text-amber-600 transition-colors p-1"
                  title="Report comment (3 flags auto-hides)"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
