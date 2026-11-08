import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import {
  fetchForumThreads,
  createForumThread,
  postForumReply,
  voteForumThread,
  flagForumThread
} from '../services/api';
import {
  MessageSquare,
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Send,
  Flag,
  CheckCircle2,
  AlertCircle,
  Hash,
  Filter,
  Sparkles
} from 'lucide-react';

const BOARDS = [
  { id: 'all', label: 'All Discussions', desc: 'Global community discourse' },
  { id: 'technology', label: 'Technology & AI', desc: 'Compute, algorithms & hardware' },
  { id: 'politics', label: 'Sovereign Policy', desc: 'Treaties, governance & accord' },
  { id: 'sports', label: 'Motorsports & Athletics', desc: 'Telemetry & biometric racing' },
  { id: 'general', label: 'Platform Integrity', desc: 'AI fact-check methodology & meta' }
];

export default function ForumView({
  initialDraft = null,
  focusThreadId = null,
  onDraftConsumed
}) {
  const { user, isAuthenticated } = useAuth();
  const [activeBoard, setActiveBoard] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent' | 'top'
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Thread Modal state
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newBoard, setNewBoard] = useState('technology');
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);
  const [threadError, setThreadError] = useState('');

  // Active reply state
  const [replyOpenThreadId, setReplyOpenThreadId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [forumMessage, setForumMessage] = useState('');

  useEffect(() => {
    if (!initialDraft) return;
    setNewBoard(initialDraft.board || 'general');
    setNewTitle(initialDraft.title || '');
    setNewContent(initialDraft.content || '');
    setThreadError('');
    setIsCreatingThread(true);
    if (onDraftConsumed) onDraftConsumed();
  }, [initialDraft, onDraftConsumed]);

  useEffect(() => {
    if (!focusThreadId || loading) return;
    const element = document.getElementById(`forum-thread-${focusThreadId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusThreadId, loading, threads]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await fetchForumThreads({ board: activeBoard, sort: sortOrder });
      setThreads(data || []);
    } catch (err) {
      console.error('Failed to load forum threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [activeBoard, sortOrder]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setThreadError('');
    setIsSubmittingThread(true);
    try {
      const created = await createForumThread({
        board: newBoard,
        title: newTitle.trim(),
        content: newContent.trim(),
        sourceUrl: initialDraft?.sourceUrl || ''
      });
      const thread = created.existing ? created.thread : created;
      setThreads([thread, ...threads.filter((item) => item._id !== thread._id)]);
      setIsCreatingThread(false);
      setNewTitle('');
      setNewContent('');
      setForumMessage('Thread posted successfully to the community forum!');
      setTimeout(() => setForumMessage(''), 4000);
    } catch (err) {
      setThreadError(err.message || 'Failed to create thread');
    } finally {
      setIsSubmittingThread(false);
    }
  };

  const handleVote = async (threadId, direction) => {
    if (!isAuthenticated) return;
    try {
      const res = await voteForumThread(threadId, direction);
      setThreads(prev =>
        prev.map(t => (t._id === threadId ? {
          ...t,
          upvotes: new Array(res.upvotes),
          downvotes: new Array(res.downvotes)
        } : t))
      );
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handlePostReply = async (threadId) => {
    if (!replyContent.trim() || isPostingReply) return;
    setIsPostingReply(true);
    try {
      const reply = await postForumReply(threadId, replyContent.trim());
      setThreads(prev =>
        prev.map(t => (t._id === threadId ? { ...t, replies: [...(t.replies || []), reply] } : t))
      );
      setReplyContent('');
      setReplyOpenThreadId(null);
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleFlagThread = async (threadId) => {
    try {
      await flagForumThread(threadId);
      setForumMessage('Thread flagged for moderator review.');
      setTimeout(() => setForumMessage(''), 3000);
    } catch (err) {
      console.error('Flag error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Forum Header */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-card-soft flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 uppercase tracking-wider mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Standalone Community Boards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            Community Discourse & Fact Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Topic-based boards, nested responses, upvoting, and citizen fact-checking.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingThread(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Discussion Thread</span>
        </button>
      </div>

      {forumMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{forumMessage}</span>
        </div>
      )}

      {/* Two-Column Split (DESIGN View 7) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Column: Category Boards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-surface-border p-4 shadow-card-soft space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-2 mb-2">
              Topic Boards
            </h3>
            {BOARDS.map((b) => {
              const isActive = activeBoard === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBoard(b.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Hash className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-teal-100' : 'text-teal-600'}`} />
                  <div>
                    <p className="leading-snug">{b.label}</p>
                    <p className={`text-[10px] font-normal font-sans mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                      {b.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Thread Browser & Nested Replies */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Filter / Sort Strip */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-surface-border p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 font-semibold px-2">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span>SORT THREADS:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSortOrder('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  sortOrder === 'recent'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortOrder('top')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  sortOrder === 'top'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Top Voted
              </button>
            </div>
          </div>

          {/* Threads List */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-400">Syncing board threads...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="bg-white rounded-3xl border border-surface-border p-12 text-center text-slate-400 font-mono text-xs shadow-card-soft">
              <MessageSquare className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p>No active threads in this board yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => {
                const score = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
                const isReplying = replyOpenThreadId === thread._id;

                return (
                  <div
                    key={thread._id}
                    id={`forum-thread-${thread._id}`}
                    className="bg-white rounded-2xl border border-surface-border p-5 shadow-card-soft space-y-4 hover:border-teal-300 transition-colors"
                  >
                    {/* Thread Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={thread.author?.name}
                          src={thread.author?.avatar}
                          className="w-8 h-8 rounded-full border border-slate-200 text-[10px]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-textPrimary">{thread.author?.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 uppercase">
                              {thread.board}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFlagThread(thread._id)}
                        className="text-slate-400 hover:text-amber-600 p-1 transition-colors"
                        title="Report thread"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thread Content */}
                    <div>
                      <h3 className="text-base font-bold text-textPrimary leading-snug mb-1.5">
                        {thread.title}
                      </h3>
                      <p className="text-xs text-textSecondary leading-relaxed">
                        {thread.content}
                      </p>
                    </div>

                    {/* Voting & Reply Trigger Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-mono">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleVote(thread._id, 'up')}
                          className="text-slate-500 hover:text-teal-700 p-1"
                          title="Upvote"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-slate-800 px-1">{score}</span>
                        <button
                          onClick={() => handleVote(thread._id, 'down')}
                          className="text-slate-500 hover:text-rose-600 p-1"
                          title="Downvote"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setReplyOpenThreadId(isReplying ? null : thread._id)}
                        className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-bold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{thread.replies?.length || 0} Replies</span>
                      </button>
                    </div>

                    {/* Nested Replies Section */}
                    {isReplying && (
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in pl-4 sm:pl-8">
                        {thread.replies?.map((rep) => (
                          <div
                            key={rep._id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
                          >
                            <Avatar
                              name={rep.author?.name}
                              src={rep.author?.avatar}
                              className="w-6 h-6 rounded-full border border-slate-200 mt-0.5 text-[9px]"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-800">{rep.author?.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed font-medium">{rep.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply Composer Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a constructive response..."
                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500"
                          />
                          <button
                            onClick={() => handlePostReply(thread._id)}
                            disabled={!replyContent.trim() || isPostingReply}
                            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-50 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* New Thread Modal */}
      {isCreatingThread && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-surface-border shadow-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-textPrimary mb-1">Create Community Discussion Thread</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">
              Engage with verified journalists, editors, and fellow readers.
            </p>

            {threadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {threadError}
              </div>
            )}

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Topic Board</label>
                <select
                  value={newBoard}
                  onChange={(e) => setNewBoard(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-textPrimary focus:outline-none focus:border-teal-500"
                >
                  <option value="technology">#technology</option>
                  <option value="politics">#politics</option>
                  <option value="sports">#sports</option>
                  <option value="general">#general</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Thread Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Optical quantum key distribution feasibility questions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Discussion Content</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Elaborate on the premise, share sources, or propose an alternative view..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingThread(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThread}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-mono shadow-xs disabled:opacity-50"
                >
                  {isSubmittingThread ? 'Posting...' : 'Create Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
