import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Compass, Flame, ArrowUpRight } from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

interface SwotViewProps {
  analysis: DecisionAnalysisResult;
}

export const SwotView: React.FC<SwotViewProps> = ({ analysis }) => {
  const { options, swot } = analysis;
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || '');

  const activeOption = options.find((o) => o.id === selectedOptionId) || options[0];
  const activeSwot = swot.find((s) => s.optionId === selectedOptionId) || swot[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Strategic SWOT Framework
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Internal Strengths & Weaknesses mapped against External Opportunities & Threats.
          </p>
        </div>

        {/* Option Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto">
          {options.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                selectedOptionId === opt.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="font-mono mr-1.5 text-stone-400">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Option Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
              Option Under Strategic Lens
            </span>
            <h4 className="text-lg font-bold text-stone-900 mt-0.5">
              {activeOption?.name}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {activeOption?.tagline}
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 max-w-md text-xs">
            <span className="font-semibold text-stone-800 block mb-0.5">
              Strategic Posture:
            </span>
            <span className="text-stone-600 leading-relaxed">
              {activeSwot?.strategicSummary || 'Balanced trade-offs across execution and risk.'}
            </span>
          </div>
        </div>
      </div>

      {/* SWOT 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: Strengths */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-stone-900">Strengths (Internal)</h5>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-medium">Controllable Assets</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {(activeSwot?.strengths || []).map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 2: Weaknesses */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-stone-900">Weaknesses (Internal)</h5>
            </div>
            <span className="text-[11px] font-mono text-rose-700 font-medium">Internal Vulnerabilities</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {(activeSwot?.weaknesses || []).map((wk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">✕</span>
                <span className="leading-relaxed">{wk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 3: Opportunities */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-stone-900">Opportunities (External)</h5>
            </div>
            <span className="text-[11px] font-mono text-blue-700 font-medium">External Tailwinds</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {(activeSwot?.opportunities || []).map((opp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">↗</span>
                <span className="leading-relaxed">{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 4: Threats */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-bold text-stone-900">Threats (External)</h5>
            </div>
            <span className="text-[11px] font-mono text-amber-700 font-medium">External Headwinds</span>
          </div>
          <ul className="space-y-2 text-xs text-stone-700">
            {(activeSwot?.threats || []).map((thr, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">!</span>
                <span className="leading-relaxed">{thr}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
