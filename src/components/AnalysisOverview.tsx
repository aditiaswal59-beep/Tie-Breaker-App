import React from 'react';
import { DoorClosed, RefreshCw, Share2, Printer, Coins, AlertCircle } from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

interface AnalysisOverviewProps {
  analysis: DecisionAnalysisResult;
  onOpenCoinToss: () => void;
  onPrint: () => void;
  onCopySummary: () => void;
  copied: boolean;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  analysis,
  onOpenCoinToss,
  onPrint,
  onCopySummary,
  copied,
}) => {
  const isHighReversibility = analysis.reversibility.toLowerCase().includes('high') || analysis.reversibility.toLowerCase().includes('two-way');
  const isLowReversibility = analysis.reversibility.toLowerCase().includes('low') || analysis.reversibility.toLowerCase().includes('one-way');

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
              <span className="uppercase tracking-wider font-semibold text-stone-700">Decision Framing</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <DoorClosed className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold text-stone-800">
                  {isLowReversibility ? 'Type 1 (One-Way Door)' : isHighReversibility ? 'Type 2 (Two-Way Door)' : 'Moderate Reversibility'}
                </span>
                <span className="text-stone-400">({analysis.reversibility})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-snug">
              {analysis.decisionTitle}
            </h1>

            <p className="text-sm text-stone-600 leading-relaxed max-w-4xl">
              {analysis.decisionSummary}
            </p>

            {/* Competing Options overview */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider mr-1">
                Weighing:
              </span>
              {analysis.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-md border border-stone-200 text-xs text-stone-800"
                >
                  <span className="font-mono font-semibold text-stone-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium">{opt.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action bar */}
          <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCoinToss}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Coins className="w-4 h-4 text-amber-700" />
              <span>Coin Flip Gut Check</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors"
                title="Copy markdown summary"
              >
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-md transition-colors"
                title="Print or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-stone-500" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
