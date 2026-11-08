import React from 'react';
import { Layers, Cpu, Globe, Trophy, Landmark } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Stories', icon: Layers },
  { id: 'Tech', label: 'Technology & AI', icon: Cpu },
  { id: 'World', label: 'World Affairs', icon: Globe },
  { id: 'Politics', label: 'Global Policy', icon: Landmark },
  { id: 'Sports', label: 'High-Tech Sports', icon: Trophy }
];

export default function CategoryBar({ activeCategory, onSelectCategory, counts = {} }) {
  return (
    <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-4">
        {/* Horizontal Chip Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            const count = counts[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-surface-border hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-100' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                {count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-teal-700/60 text-teal-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Filter Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-teal-600"></span>
          <span>LIVE INDEX SYNC</span>
        </div>
      </div>
    </div>
  );
}
