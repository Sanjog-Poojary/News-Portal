import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function TrustBadge({ trustScore, size = 'sm', showConfidence = true }) {
  if (!trustScore) return null;

  const score = trustScore.confidence || 0;
  const status = (trustScore.status || 'verified').toLowerCase();
  const rollup = trustScore.rollup || (score >= 80 ? 'Verified' : score >= 50 ? 'Needs Context' : 'Disputed');

  // Ivory & Teal palette status styles (Strict Zero-Purple)
  let badgeStyle = {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    dot: 'bg-teal-600',
    icon: ShieldCheck
  };

  if (status === 'disputed' || score < 50) {
    badgeStyle = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
      icon: AlertTriangle
    };
  } else if (status === 'needs_context' || (score >= 50 && score < 80)) {
    badgeStyle = {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      dot: 'bg-sky-600',
      icon: HelpCircle
    };
  }

  const Icon = badgeStyle.icon;

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border} shadow-sm`}>
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-teal-100 shadow-xs">
          <Icon className={`w-4 h-4 ${badgeStyle.text}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold tracking-wider uppercase font-mono ${badgeStyle.text}`}>
              {rollup}
            </span>
            {showConfidence && (
              <span className="text-[11px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                {score}% Conf.
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Automated AI Fact-Check Verification</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text} shadow-xs`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-semibold tracking-wide">{rollup}</span>
      {showConfidence && score > 0 && (
        <span className="font-mono text-[11px] opacity-75 pl-1 border-l border-current/25 font-bold">
          {score}%
        </span>
      )}
    </div>
  );
}
