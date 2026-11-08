import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSocket } from '../context/SocketContext';
import { Zap, BellRing, ExternalLink, X } from 'lucide-react';

export default function BreakingTicker({ onSelectArticle }) {
  const { breakingNews, isConnected, latestAlert, dismissAlert } = useSocket();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!breakingNews.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);

  const currentItem = breakingNews[currentIndex] || {
    headline: 'Real-time WebSocket intelligence feed syncing with AI fact-check pipelines...',
    category: 'Live Dispatch',
    urgency: 'high'
  };

  const openBreakingCard = () => {
    setSelectedItem(currentItem);
  };

  const handleTickerKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openBreakingCard();
    }
  };

  return (
    <div className="relative w-full z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border shadow-xs">
      {/* Real-time Broadcast Toast Notification Popup */}
      {latestAlert && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-teal-300 shadow-xl text-textPrimary">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 animate-pulse border border-teal-200">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                  New Breaking Dispatch
                </span>
                <span className="text-xs text-textMuted font-mono">{latestAlert.category}</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 max-w-md line-clamp-1">
                {latestAlert.headline}
              </p>
            </div>
            <button
              onClick={dismissAlert}
              className="ml-2 text-slate-500 hover:text-slate-900 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {selectedItem &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
            role="presentation"
            onClick={() => setSelectedItem(null)}
          >
            <article
              className="w-full max-w-xl rounded-2xl border border-teal-200 bg-white p-6 text-textPrimary shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="breaking-news-card-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Breaking news
                  </span>
                  <span className="text-xs font-mono text-textMuted">
                    {selectedItem.category || 'General'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close breaking news"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h2
                id="breaking-news-card-title"
                className="mt-5 text-xl font-bold leading-snug text-slate-900"
              >
                {selectedItem.headline}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {selectedItem.description ||
                  'This breaking update is available from the live news feed. Read the original source for the full report.'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono uppercase tracking-wide">
                  Urgency: {selectedItem.urgency || 'high'}
                </span>
                {selectedItem.timestamp && (
                  <time dateTime={selectedItem.timestamp}>
                    {new Date(selectedItem.timestamp).toLocaleString()}
                  </time>
                )}
              </div>

              {selectedItem.sourceUrl && (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  Read original source
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          </div>,
          document.body
        )}

      {/* Main Ticker Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div
          className="flex cursor-pointer items-center justify-between gap-4 rounded-lg text-xs transition-colors hover:bg-teal-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          onClick={openBreakingCard}
          onKeyDown={handleTickerKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`View breaking news: ${currentItem.headline}`}
        >
          {/* Beacon + Label */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-3 h-3 rounded-full bg-teal-500 opacity-60 animate-ping"></span>
              <span className="relative w-2 h-2 rounded-full bg-teal-600 shadow-xs"></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold tracking-wider uppercase text-[11px]">
              <Zap className="w-3 h-3 text-teal-600" />
              <span>BREAKING</span>
            </div>
          </div>

          {/* Headline Content */}
          <div className="flex-1 overflow-hidden flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0 font-medium">
              {currentItem.category || 'World'}
            </span>
            <p
              key={currentIndex}
              className="text-slate-800 font-medium truncate animate-fade-in hover:text-teal-700 cursor-pointer transition-colors"
            >
              {currentItem.headline}
            </p>
          </div>

          {/* Status & Pagination */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-teal-600' : 'bg-amber-500'
                }`}
              ></span>
              <span className="font-medium">{isConnected ? 'WS LIVE' : 'CONNECTING'}</span>
            </div>

            {breakingNews.length > 1 && (
              <div className="flex items-center gap-1">
                {breakingNews.slice(0, 4).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(event) => {
                      event.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-4 bg-teal-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
