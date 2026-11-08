import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import HeroCarousel from './components/HeroCarousel';
import CategoryBar from './components/CategoryBar';
import ArticleGrid from './components/ArticleGrid';
import ArticleDetailView from './components/ArticleDetailView';
import AuthorDashboard from './components/AuthorDashboard';
import AdminDashboard from './components/AdminDashboard';
import ForumView from './components/ForumView';
import AdminBroadcastModal from './components/AdminBroadcastModal';
import AuthPage from './components/AuthPage';
import LiveFeedSection from './components/LiveFeedSection';
import { useSocket } from './context/SocketContext';
import { fetchArticles, fetchForumThreadBySource } from './services/api';
import { ShieldCheck, Activity, Compass, MessageSquare, PenTool, ExternalLink } from 'lucide-react';

export default function App() {
  // Navigation View State: 'home' | 'article' | 'forum' | 'author' | 'admin'
  const [currentView, setCurrentView] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { liveFeedItems } = useSocket();
  const [forumDraft, setForumDraft] = useState(null);
  const [focusForumThreadId, setFocusForumThreadId] = useState(null);
  
  // Modals state
  const [isAdminBroadcastOpen, setIsAdminBroadcastOpen] = useState(false);

  // Category counts calculation
  const [categoryCounts, setCategoryCounts] = useState({});

  // Sync with window URL hash for clean deep-linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('article/')) {
        const id = hash.replace('article/', '');
        setSelectedArticleId(id);
        setCurrentView('article');
      } else if (['forum', 'author', 'admin', 'home', 'login', 'register'].includes(hash)) {
        setCurrentView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when view changes
  const navigateToView = (view, articleId = null) => {
    setCurrentView(view);
    if (view === 'article' && articleId) {
      setSelectedArticleId(articleId);
      window.location.hash = `article/${articleId}`;
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load articles based on active filter & search query
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchArticles({ category: activeCategory, search: searchQuery })
      .then((data) => {
        if (!isMounted) return;
        setArticles(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load articles:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, searchQuery]);

  // Compute category counts
  useEffect(() => {
    fetchArticles({ category: 'All', search: '' })
      .then((allData) => {
        const counts = { All: allData.length };
        allData.forEach((a) => {
          counts[a.category] = (counts[a.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      })
      .catch((e) => console.warn('Could not compute counts:', e));
  }, []);

  const handleSelectArticle = (article) => {
    navigateToView('article', article._id);
  };

  const handleStartDiscussion = async (item) => {
    try {
      const existingThread = await fetchForumThreadBySource(item.url);
      if (existingThread) {
        setForumDraft(null);
        setFocusForumThreadId(existingThread._id);
        navigateToView('forum');
        return;
      }
    } catch (error) {
      console.warn('Could not check for an existing discussion:', error);
    }

    setForumDraft({
      board: 'general',
      title: `Discussion: ${item.title}`,
      content: `${item.description || 'Live feed item shared for community discussion.'}\n\nSource: ${item.url}`,
      sourceUrl: item.url
    });
    setFocusForumThreadId(null);
    navigateToView('forum');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-textPrimary selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Real-Time Breaking News Ribbon */}
      <BreakingTicker onSelectArticle={handleSelectArticle} />

      {/* Floating Global Glass Navigation Shell */}
      <Navbar
        currentView={currentView}
        onChangeView={navigateToView}
        onOpenAuth={() => navigateToView('login')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          navigateToView('home');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 space-y-2 pb-20">
        
        {/* VIEW 1: HOME / LANDING VIEW */}
        {currentView === 'home' && (
          <>
            {!searchQuery && (
              <HeroCarousel
                articles={articles}
                onSelectArticle={handleSelectArticle}
              />
            )}

            <CategoryBar
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              counts={categoryCounts}
            />

            <LiveFeedSection
              items={liveFeedItems}
              onStartDiscussion={handleStartDiscussion}
            />

            <ArticleGrid
              articles={articles}
              loading={loading}
              onSelectArticle={handleSelectArticle}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
            />
          </>
        )}

        {/* VIEW 2: STANDALONE ARTICLE DETAIL VIEW (PHASE 2) */}
        {currentView === 'article' && (
          <ArticleDetailView
            articleId={selectedArticleId}
            onBack={() => navigateToView('home')}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              navigateToView('home');
            }}
          />
        )}

        {/* VIEW 5: AUTHOR DASHBOARD & WYSIWYG (PHASE 3) */}
        {currentView === 'author' && (
          <AuthorDashboard
            onSelectArticle={handleSelectArticle}
          />
        )}

        {/* VIEW 6: ADMIN CONTROL PANEL (PHASE 3) */}
        {currentView === 'admin' && (
          <AdminDashboard
            onOpenBroadcast={() => setIsAdminBroadcastOpen(true)}
          />
        )}

        {/* AUTHENTICATION VIEWS */}
        {(currentView === 'login' || currentView === 'register') && (
          <AuthPage
            mode={currentView}
            onNavigate={navigateToView}
          />
        )}

        {/* VIEW 7: COMMUNITY FORUM VIEW (PHASE 3) */}
        {currentView === 'forum' && (
          <ForumView
            initialDraft={forumDraft}
            focusThreadId={focusForumThreadId}
            onDraftConsumed={() => setForumDraft(null)}
          />
        )}

      </main>

      {/* Editorial Ivory & Teal Footer */}
      <footer className="border-t border-surface-border bg-white py-12 mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-mono font-black text-sm">
                  N
                </div>
                <span className="font-mono font-bold text-textPrimary text-base">NEWS.PORTAL</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                Next-generation journalistic media platform engineered for high-velocity publishing
                with verifiable algorithmic fact-checking and human-in-the-loop oversight.
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-teal-800">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 font-bold">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>INTEGRITY PROTOCOL ACTIVE</span>
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-3">
                Guardrail Directives
              </h4>
              <ul className="text-xs text-slate-500 space-y-2 font-mono">
                <li>• Zero-Purple Palette Standard</li>
                <li>• Mandatory HITL Rationale &ge; 15 chars</li>
                <li>• 3s Real-Time WebSocket Throttling</li>
                <li>• Stored XSS DOMPurify Sanitization</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-3">
                System Topology
              </h4>
              <ul className="text-xs text-slate-500 space-y-2 font-mono">
                <li>• Client: React 18 + Vite + Tailwind</li>
                <li>• Engine: Express + Socket.io Server</li>
                <li>• Access: Stateless JWT RBAC</li>
                <li>• Status: <span className="text-teal-700 font-bold">Operational</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <p>© 2026 NEWS.PORTAL Media Systems. All fact-checking ratings cryptographically indexed.</p>
            <p className="text-teal-700 font-semibold">Aesthetic: Warm Ivory & Deep Teal Editorial</p>
          </div>
        </div>
      </footer>

      {/* Admin Breaking Broadcast Console */}
      <AdminBroadcastModal
        isOpen={isAdminBroadcastOpen}
        onClose={() => setIsAdminBroadcastOpen(false)}
      />
    </div>
  );
}
