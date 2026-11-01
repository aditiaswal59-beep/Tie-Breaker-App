import React from 'react';
import { Scale, History, PlusCircle, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  hasActiveDecision: boolean;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  savedCount,
  hasActiveDecision,
  onLoadSample,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center shadow-sm">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-950 tracking-tight text-lg">The Tiebreaker</span>
              <span className="text-xs text-stone-500 font-normal hidden sm:inline">· AI Decision Engine</span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              Pros & Cons · Comparison Matrix · SWOT · Weighted Verdicts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!hasActiveDecision && (
            <button
              onClick={onLoadSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span>Sample Dilemmas</span>
            </button>
          )}

          {hasActiveDecision && (
            <button
              onClick={onNewDecision}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-600" />
              <span>New Decision</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            type="button"
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-md shadow-xs transition-colors"
            title="Saved decisions history"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Past Decisions</span>
            {savedCount > 0 && (
              <span className="ml-1 text-[11px] font-mono font-medium text-stone-600">
                ({savedCount})
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
