import React, { useState } from 'react';
import { X, Radio, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { broadcastBreakingNews } from '../services/api';

export default function AdminBroadcastModal({ isOpen, onClose }) {
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Tech');
  const [urgency, setUrgency] = useState('high');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!headline.trim() || isSending) return;

    setStatusMsg('');
    setErrorMsg('');
    setIsSending(true);

    try {
      await broadcastBreakingNews({
        headline: headline.trim(),
        category,
        urgency
      });
      setStatusMsg('Alert broadcasted across all active client sockets!');
      setHeadline('');
      setTimeout(() => {
        setStatusMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Broadcast failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-surface-border shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary">Live Breaking Dispatcher</h3>
            <p className="text-xs text-textSecondary font-mono">
              Admin WebSocket Broadcast Console (Max 5/min)
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">
              Urgent Headline Announcement
            </label>
            <textarea
              required
              rows={3}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Breakthrough achieved in room-temperature semiconductor verification..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-teal-500"
              >
                <option value="Tech">Tech & AI</option>
                <option value="World">World Affairs</option>
                <option value="Politics">Global Policy</option>
                <option value="Sports">Motorsports / Athletics</option>
                <option value="General">General News</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-textPrimary focus:outline-none focus:border-teal-500"
              >
                <option value="high">High Urgency</option>
                <option value="critical">Critical / Emergency</option>
                <option value="medium">Standard Bulletin</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending || !headline.trim()}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Pushing to Sockets...' : 'Transmit Breaking Alert'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
