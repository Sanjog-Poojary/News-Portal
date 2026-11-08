import React, { useState } from 'react';
import { Clock, ExternalLink, MessageSquarePlus, Radio, X } from 'lucide-react';

function formatDate(value) {
  if (!value) return 'Recently updated';
  return new Date(value).toLocaleString();
}

export default function LiveFeedSection({ items = [], onStartDiscussion }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!items.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-mono text-[11px] font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            <span>Live feed</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-textPrimary">Latest from trusted sources</h2>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          Stored in MongoDB
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.slice(0, 3).map((item) => (
          <button
            type="button"
            key={item._id || item.url}
            onClick={() => setSelectedItem(item)}
            className="group text-left rounded-2xl border border-surface-border bg-white p-4 shadow-card-soft transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="mb-4 h-32 w-full rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-teal-700">
              <span>{item.sourceName || 'RSS source'}</span>
              <span className="text-slate-400">Live</span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-teal-700">
              {item.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
              {item.description || 'Open this live update to view the available source summary.'}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(item.publishedAt || item.fetchedAt)}
            </div>
          </button>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSelectedItem(null)}
        >
          <article
            className="w-full max-w-xl rounded-2xl border border-teal-200 bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-feed-card-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700">
                  {selectedItem.sourceName || 'RSS source'}
                </span>
                <h2 id="live-feed-card-title" className="mt-2 text-xl font-bold leading-snug text-slate-900">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close live feed item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {selectedItem.description || 'The source did not provide a summary for this item.'}
            </p>
            <div className="mt-4 text-xs text-slate-500">
              {formatDate(selectedItem.publishedAt || selectedItem.fetchedAt)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {onStartDiscussion && (
                <button
                  type="button"
                  onClick={() => onStartDiscussion(selectedItem)}
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100"
                >
                  Start a discussion
                  <MessageSquarePlus className="h-4 w-4" />
                </button>
              )}
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
              >
                Read original source
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
