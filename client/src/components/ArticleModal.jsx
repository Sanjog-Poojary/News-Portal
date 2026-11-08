import React, { useState, useEffect } from 'react';
import TrustBadge from './TrustBadge';
import Avatar from './Avatar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { fetchArticle, fetchComments, postComment, flagComment, toggleLike, toggleBookmark } from '../services/api';
import {
  X,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Heart,
  Bookmark,
  Send,
  Flag,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

export default function ArticleModal({ articleId, onClose }) {
  const { socket } = useSocket();
  const { user, isAuthenticated } = useAuth();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showClaims, setShowClaims] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load article details & comments
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

    // Join Socket.io room for real-time comments
    if (socket) {
      socket.emit('article:join', articleId);

      const handleNewComment = (comment) => {
        setComments((prev) => [comment, ...prev.filter((c) => c._id !== comment._id)]);
      };

      const handleModeratedComment = ({ commentId }) => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      };

      socket.on('comment:new', handleNewComment);
      socket.on('comment:moderated', handleModeratedComment);

      return () => {
        socket.emit('article:leave', articleId);
        socket.off('comment:new', handleNewComment);
        socket.off('comment:moderated', handleModeratedComment);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [articleId, socket]);

  // Handle Comment Submission
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;

    setCommentError('');
    setIsPosting(true);

    try {
      const created = await postComment(articleId, newComment.trim());
      // Local immediate optimistic insertion
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
    try {
      const res = await toggleLike(articleId);
      if (res && res.likeCount !== undefined) {
        setLikes(res.likeCount);
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

  if (!articleId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-start justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden my-4">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-neon-cyan hover:border-neon-cyan flex items-center justify-center transition-all backdrop-blur-md"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-400">Loading AI verified report...</p>
          </div>
        ) : article ? (
          <div>
            {/* Hero Cover Header */}
            <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden bg-slate-950">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />

              <div className="absolute bottom-4 left-4 sm:left-8 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider font-bold bg-slate-950/80 text-neon-cyan border border-neon-cyan/40 backdrop-blur-md">
                  {article.category}
                </span>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/70 px-3 py-1 rounded-lg border border-slate-800 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>

            {/* Article Content Container */}
            <div className="p-6 sm:p-8 md:p-10 space-y-8">
              
              {/* Title & Author Meta */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={article.author?.name}
                      src={article.author?.avatar}
                      className="w-10 h-10 rounded-full border border-slate-700 text-xs"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-200">{article.author?.name}</p>
                      <p className="text-xs text-textMuted font-mono">
                        Published {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Quick Engagement Strip */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLike}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-400/40 text-xs font-mono transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{likes}</span>
                    </button>

                    <button
                      onClick={handleBookmark}
                      className={`p-2 rounded-xl border text-xs transition-all ${
                        isBookmarked
                          ? 'bg-neon-cyan text-slate-950 border-neon-cyan shadow-neon-glow'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-neon-cyan hover:border-neon-cyan'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* View 2 Requirement: AI Fact-Check Banner & Claim Drilldown */}
              <div className="rounded-xl border border-neon-cyan/30 bg-slate-900/90 p-5 shadow-neon-glow">
                <div
                  onClick={() => setShowClaims(!showClaims)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <TrustBadge trustScore={article.trustScore} size="lg" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan hover:text-neon-sky">
                    <span>{showClaims ? 'Hide Claim Verification Tree' : 'Expand Claim Breakdown'}</span>
                    {showClaims ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expandable Claims Breakdown */}
                {showClaims && article.claims && article.claims.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Extracted Claims & Resolvable Citations ({article.claims.length}):
                    </h4>
                    <div className="space-y-2.5">
                      {article.claims.map((claim, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                #{idx + 1}
                              </span>
                              <span
                                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                                  claim.status === 'Verified'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-[#00F5D4]'
                                    : claim.status === 'Needs Context'
                                    ? 'bg-sky-500/10 border-sky-500/30 text-[#38BDF8]'
                                    : 'bg-amber-500/10 border-amber-500/30 text-[#F59E0B]'
                                }`}
                              >
                                {claim.status} ({claim.confidence}% Conf.)
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-200 mb-2 font-medium">"{claim.claimText}"</p>

                          {/* Sources */}
                          {claim.sources && claim.sources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
                              <span className="text-[10px] font-mono text-slate-500">Indexed Sources:</span>
                              {claim.sources.map((src, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-neon-cyan hover:underline bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                                >
                                  <span>{src.name}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
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

              {/* Reading Body with Sanitized HTML markup */}
              <div
                className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />

              {/* Tags Strip */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
                  <span className="text-xs font-mono text-slate-500">Tags:</span>
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Live WebSocket Comment Stream (PRD 3.4 & DESIGN View 2) */}
              <div className="pt-8 border-t border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neon-cyan" />
                    <h3 className="text-lg font-bold text-white">Live Discussion Stream</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      {comments.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Socket.io Stream Active</span>
                </div>

                {/* Comment Posting Input Box */}
                <form onSubmit={handlePostComment} className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        isAuthenticated
                          ? `Join the discussion as ${user.name}...`
                          : 'Sign in to post comments (Throttled to 1 msg / 3 sec)'
                      }
                      rows={3}
                      className="w-full p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                    />
                  </div>

                  {commentError && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {commentError}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Guardrail: 3s anti-spam throttle • Auto-moderation enabled
                    </span>
                    <button
                      type="submit"
                      disabled={isPosting || !newComment.trim()}
                      className="px-4 py-2 rounded-xl bg-neon-cyan hover:bg-neon-sky text-slate-950 font-bold text-xs tracking-wider uppercase disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-neon-glow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPosting ? 'Broadcasting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </form>

                {/* Real-time Comments Feed */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono py-4 text-center">
                      No comments yet. Be the first to start the live discussion!
                    </p>
                  ) : (
                    comments.map((comm) => (
                      <div
                        key={comm._id}
                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 animate-fade-in"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            name={comm.author?.name}
                            src={comm.author?.avatar}
                            className="w-7 h-7 rounded-full border border-slate-700 mt-0.5 text-[9px]"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-200">
                                {comm.author?.name || 'Anonymous Reader'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {new Date(comm.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{comm.content}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleFlagComment(comm._id)}
                          className="text-slate-600 hover:text-amber-400 transition-colors p-1"
                          title="Report/Flag comment (3 flags auto-hides)"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
