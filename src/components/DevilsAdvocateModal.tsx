import React, { useState } from 'react';
import { X, Flame, AlertOctagon, ShieldCheck, Flag, Sparkles } from 'lucide-react';
import { DecisionAnalysisResult, DevilsAdvocateResult } from '../types/decision';

interface DevilsAdvocateModalProps {
  analysis: DecisionAnalysisResult;
  onClose: () => void;
}

export const DevilsAdvocateModal: React.FC<DevilsAdvocateModalProps> = ({ analysis, onClose }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    analysis.tiebreakerVerdict.recommendedOptionId || analysis.options[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DevilsAdvocateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];

  const handleRunStressTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma: analysis.decisionTitle,
          chosenOptionName: activeOption.name,
          options: analysis.options.map((o) => o.name),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate stress test.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on open if not run yet
  React.useEffect(() => {
    handleRunStressTest();
  }, [selectedOptionId]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-300 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Devil's Advocate Pre-Mortem
            </h3>
            <p className="text-xs text-stone-500">
              Imagine it's 12 months in the future and this choice failed. What went wrong?
            </p>
          </div>
        </div>

        {/* Option Selector */}
        <div className="my-4 flex items-center gap-2 p-1 bg-stone-100 rounded-lg">
          <span className="text-xs text-stone-500 px-2 font-medium">Challenging:</span>
          {analysis.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              disabled={loading}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedOptionId === opt.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-stone-600">
              Simulating future failure failure modes & blind spots...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-5 text-xs text-stone-700">
            {/* The Catastrophic Assumption */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 font-bold text-rose-950 mb-1">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>The Fragile Assumption</span>
              </div>
              <p className="text-rose-900 leading-relaxed font-medium">
                "{result.catastrophicAssumption}"
              </p>
            </div>

            {/* Simulated Failure Story */}
            <div className="space-y-1.5">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Pre-Mortem Failure Narrative
              </span>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl leading-relaxed text-stone-700">
                {result.failureStory}
              </div>
            </div>

            {/* Bulletproofing mitigations */}
            <div className="space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>How to Bulletproof this Choice Today</span>
              </span>
              <div className="space-y-2">
                {result.counterPunchMitigations.map((mit, i) => (
                  <div key={i} className="flex items-start gap-2 bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-lg text-emerald-950">
                    <span className="font-mono text-emerald-600 font-bold">{i + 1}.</span>
                    <span>{mit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pivot Indicators */}
            <div className="space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-600" />
                <span>Early Warning Signs to Pivot Away</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                {result.pivotIndicators.map((ind, i) => (
                  <li key={i}>{ind}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Stress Test
          </button>
        </div>
      </div>
    </div>
  );
};
