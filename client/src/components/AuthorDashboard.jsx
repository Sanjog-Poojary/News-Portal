import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchArticles,
  fetchAuthorMetrics,
  createArticle,
  updateArticle,
  scanArticleDraft,
  overrideFactCheckClaim
} from '../services/api';
import TrustBadge from './TrustBadge';
import {
  PenTool,
  BookOpen,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
  Send,
  PlusCircle,
  FileText,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  Link2,
  ExternalLink,
  Edit3,
  Sliders,
  Check
} from 'lucide-react';

export default function AuthorDashboard({ onSelectArticle }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalPublished: 0, draftsPending: 0, totalViews: 0 });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editor mode state
  const [isComposing, setIsComposing] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Tech');
  const [tagsInput, setTagsInput] = useState('AI Compute, Photonics');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'
  );
  
  // AI Fact Check Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // HITL Override Modal state
  const [overrideModal, setOverrideModal] = useState(null); // { claimIndex, currentStatus }
  const [overrideStatus, setOverrideStatus] = useState('Verified');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [m, arts] = await Promise.all([
        fetchAuthorMetrics(),
        fetchArticles({ status: 'all', authorId: user?._id })
      ]);
      setMetrics(m);
      setArticles(arts);
    } catch (err) {
      console.error('Failed to load author dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Insert rich formatting tags into body
  const insertFormatting = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('wysiwyg-body');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end) || 'text';
    const replacement = `${tagOpen}${selected}${tagClose}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
  };

  // Run AI Fact Check Scan
  const handleRunAiScan = async () => {
    if (!body.trim() || body.length < 15) {
      setErrorMessage('Please write body content before running the AI Fact-Check scan.');
      return;
    }
    setErrorMessage('');
    setIsScanning(true);
    try {
      const res = await scanArticleDraft(title, body);
      setScanResult(res);
    } catch (err) {
      setErrorMessage(err.message || 'AI Fact-Check scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  // Submit Article (Draft or Published)
  const handleSaveArticle = async (status = 'published') => {
    if (!title.trim() || !body.trim()) {
      setErrorMessage('Title and body content are required.');
      return;
    }
    setErrorMessage('');
    setSaveSuccess('');

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      title,
      summary,
      body,
      category,
      tags,
      coverImage,
      status,
      claims: scanResult?.claims || [],
      trustScore: scanResult?.trustScore || {
        rollup: 'Pending AI Verification',
        confidence: 0,
        status: 'pending'
      }
    };

    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, payload);
        setSaveSuccess(`Story updated successfully in "${status}" state!`);
      } else {
        await createArticle(payload);
        setSaveSuccess(`Story submitted successfully as "${status}"!`);
      }
      setIsComposing(false);
      setEditingArticleId(null);
      resetEditorFields();
      loadDashboardData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save article.');
    }
  };

  const handleEditClick = (article) => {
    setEditingArticleId(article._id);
    setTitle(article.title);
    setSummary(article.summary || '');
    setBody(article.body);
    setCategory(article.category);
    setTagsInput((article.tags || []).join(', '));
    setCoverImage(article.coverImage);
    setScanResult({
      claims: article.claims || [],
      trustScore: article.trustScore
    });
    setIsComposing(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const resetEditorFields = () => {
    setTitle('');
    setSummary('');
    setBody('');
    setCategory('Tech');
    setTagsInput('Photonics, AI Infrastructure');
    setScanResult(null);
    setEditingArticleId(null);
  };

  // Submit HITL Claim Override
  const handleSubmitOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.trim().length < 15) {
      setOverrideError('Guardrail: Rationale must be at least 15 characters.');
      return;
    }

    try {
      await overrideFactCheckClaim({
        articleId: editingArticleId || 'new_draft',
        claimIndex: overrideModal.claimIndex,
        overriddenStatus: overrideStatus,
        reason: overrideReason.trim()
      });

      // Update local scan state
      if (scanResult && scanResult.claims[overrideModal.claimIndex]) {
        const updatedClaims = [...scanResult.claims];
        updatedClaims[overrideModal.claimIndex].status = overrideStatus;
        setScanResult({ ...scanResult, claims: updatedClaims });
      }

      setOverrideModal(null);
      setOverrideReason('');
      setOverrideError('');
    } catch (err) {
      setOverrideError(err.message || 'Failed to record override.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-card-soft flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 uppercase tracking-wider mb-2">
            <PenTool className="w-4 h-4" />
            <span>Author Studio & Editorial Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            Welcome, {user?.name || 'Elena Rostova'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish verified stories, run asynchronous AI claim scans, and manage editorial review queues.
          </p>
        </div>

        <button
          onClick={() => {
            resetEditorFields();
            setIsComposing(!isComposing);
          }}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isComposing ? 'Close Editor' : 'Compose New Story'}</span>
        </button>
      </div>

      {/* 3-Card Analytics Ribbon (DESIGN View 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Total Published</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-textPrimary">{metrics.totalPublished}</p>
          <p className="text-[11px] text-teal-700 font-mono mt-1 font-semibold">Active in public feeds</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">Drafts Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-textPrimary">{metrics.draftsPending}</p>
          <p className="text-[11px] text-amber-600 font-mono mt-1 font-semibold">Awaiting review or scan</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">30-Day Views</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold text-textPrimary">{metrics.totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 font-mono mt-1 font-semibold">Across all publications</p>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* WYSIWYG Editor Suite (DESIGN View 5) */}
      {isComposing && (
        <div className="bg-white rounded-3xl border border-teal-300 p-6 sm:p-10 shadow-lg space-y-6 animate-slide-up">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-textPrimary">
                {editingArticleId ? 'Edit Article & AI Fact-Check Pipeline' : 'Rich Text Composer & AI Pipeline'}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">DOMPurify Active • XSS Sanitized</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title & Summary */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Article Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Generation Solar Concentrators Break Thermal Latency Records..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Editorial Summary / Subtitle</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence overview of the investigation..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Category & Cover URL */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-teal-500 font-semibold"
                >
                  <option value="Tech">Technology & AI</option>
                  <option value="World">World Affairs</option>
                  <option value="Politics">Global Policy</option>
                  <option value="Sports">High-Tech Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* WYSIWYG Formatting Toolbar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('<h2>', '</h2>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="Heading 2"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<h3>', '</h3>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="Heading 3"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<ul><li>', '</li></ul>')}
                className="p-1.5 rounded-lg hover:bg-white hover:text-teal-700 transition-colors"
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<mark class="claim-highlight">', '</mark>')}
                className="px-2 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-mono font-bold hover:bg-teal-100"
                title="Highlight inline fact-checked claim"
              >
                + Highlight Claim
              </button>
            </div>

            <textarea
              id="wysiwyg-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="<p>Write your detailed journalistic investigation here in HTML or plain text...</p>"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          {/* Action Bar: AI Fact-Check Scan & Save */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={handleRunAiScan}
              disabled={isScanning || !body.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>{isScanning ? 'Running Asynchronous Claim Scan...' : 'Submit for AI Fact-Check'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveArticle('draft')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveArticle('published')}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold tracking-wider uppercase shadow-xs transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish to Feed</span>
              </button>
            </div>
          </div>

          {/* AI Scan Results & HITL Review Panel */}
          {scanResult && (
            <div className="mt-6 p-6 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TrustBadge trustScore={scanResult.trustScore} size="lg" />
                  <span className="text-xs font-mono font-bold text-teal-900">
                    Rollup Confidence: {scanResult.trustScore?.confidence}%
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {scanResult.claims?.length || 0} claims detected
                </span>
              </div>

              <div className="space-y-2.5">
                {scanResult.claims?.map((claim, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-teal-100 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-mono font-bold text-teal-800">
                          {claim.status} ({claim.confidence}% Conf.)
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">"{claim.claimText}"</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOverrideModal({ claimIndex: idx, currentStatus: claim.status })}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-teal-700 hover:text-teal-900 text-[11px] font-mono font-bold transition-colors"
                    >
                      Override Status
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Article Management Data Table (DESIGN View 5) */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
            <span>Authored Publications & Status Lifecycle</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
              {articles.length}
            </span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Filtered by Current Author</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Fact-Check</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                    No articles found. Click "Compose New Story" above to publish your first report!
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 max-w-sm">
                      <p
                        onClick={() => onSelectArticle && onSelectArticle(art)}
                        className="font-bold text-textPrimary hover:text-teal-700 cursor-pointer line-clamp-1"
                      >
                        {art.title}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(art.createdAt).toLocaleDateString()} • {art.readTime}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                          art.status === 'published'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <TrustBadge trustScore={art.trustScore} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(art)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-mono font-bold border border-teal-200 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HITL Claim Override Modal (GAURDRAIL.md Constraint: Minimum 15-char rationale) */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-surface-border shadow-2xl p-6">
            <h3 className="text-base font-bold text-textPrimary mb-1">Human-in-the-Loop Claim Override</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Mandatory Guardrail: Changes are recorded to FactCheckLog audit trails.
            </p>

            {overrideError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleSubmitOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">
                  Overridden Verification Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-textPrimary focus:outline-none focus:border-teal-500"
                >
                  <option value="Verified">Verified</option>
                  <option value="Needs Context">Needs Context</option>
                  <option value="Disputed">Disputed</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">
                  Mandatory Editorial Rationale (min. 15 characters)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State primary source documentation or reason for overriding algorithmic verdict..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                  Character count: {overrideReason.length} / 15 minimum
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-mono shadow-xs"
                >
                  Record Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
