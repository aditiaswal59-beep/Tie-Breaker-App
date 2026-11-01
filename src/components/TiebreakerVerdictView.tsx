import React from 'react';
import {
  Award,
  Compass,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Flame,
  Shuffle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

interface TiebreakerVerdictViewProps {
  analysis: DecisionAnalysisResult;
  onOpenDevilsAdvocate: () => void;
  onOpenScenarioSimulator: () => void;
  onOpenCoinToss: () => void;
}

export const TiebreakerVerdictView: React.FC<TiebreakerVerdictViewProps> = ({
  analysis,
  onOpenDevilsAdvocate,
  onOpenScenarioSimulator,
  onOpenCoinToss,
}) => {
  const { options, tiebreakerVerdict } = analysis;
  const recommendedOption = options.find((o) => o.id === tiebreakerVerdict.recommendedOptionId) || options[0];

  return (
    <div className="space-y-8">
      {/* Primary Recommended Card */}
      <div className="bg-white border-2 border-amber-400/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-xs">
          <Award className="w-3.5 h-3.5" />
          <span>The Tiebreaker Verdict</span>
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
            <span className="font-semibold text-stone-700 uppercase tracking-wider">Recommended Path</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-semibold">
              Confidence: {tiebreakerVerdict.confidence}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {recommendedOption?.name}
          </h2>

          <p className="text-base sm:text-lg font-medium text-amber-900 bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 leading-relaxed">
            "{tiebreakerVerdict.headline}"
          </p>

          <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-3 pt-2">
            {tiebreakerVerdict.reasoning}
          </div>
        </div>
      </div>

      {/* Decision Rules of Thumb: "Choose X If..." */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-stone-700" />
            <span>Definitive Decision Rules (If/Then Triggers)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Clear personal boundary conditions to resolve the tie depending on your exact circumstances:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiebreakerVerdict.rulesOfThumb.map((rule, idx) => {
            const ruleOption = options.find((o) => o.id === rule.optionId);
            const isWinner = rule.optionId === tiebreakerVerdict.recommendedOptionId;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isWinner
                    ? 'bg-white border-amber-300 shadow-2xs'
                    : 'bg-white/80 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">
                    {ruleOption?.name || `Option ${rule.optionId}`}
                  </span>
                  {isWinner && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      Primary Winner
                    </span>
                  )}
                </div>
                <p className="text-stone-700 leading-relaxed font-medium">
                  {rule.condition}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Behavioral Blindspot & Regret Minimization Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Psychological Blindspot */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <div className="w-7 h-7 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
              <Eye className="w-4 h-4 text-stone-800" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-500">
                Cognitive Blindspot
              </h4>
              <span className="text-sm font-bold text-stone-900">The Trap to Avoid</span>
            </div>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {tiebreakerVerdict.blindspot}
          </p>
        </div>

        {/* 10-Year Regret Minimization */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <div className="w-7 h-7 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
              <Clock className="w-4 h-4 text-stone-800" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-stone-500">
                10-Year Regret Horizon
              </h4>
              <span className="text-sm font-bold text-stone-900">Long-Term Perspective</span>
            </div>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {tiebreakerVerdict.regretMinimizationTakeaway}
          </p>
        </div>
      </div>

      {/* Immediate Micro-Experiment */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <h4 className="text-sm font-bold text-emerald-950">
            Recommended 48-Hour Micro-Experiment
          </h4>
        </div>
        <p className="text-xs text-emerald-900 leading-relaxed">
          {tiebreakerVerdict.immediateNextStep}
        </p>
      </div>

      {/* Stress-Testing & Interactive Tools Card */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Still On The Fence? Stress-Test The Verdict</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Probe blind spots, simulate future shocks, or test your subconscious instinct.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenDevilsAdvocate}
            className="p-4 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-lg text-left transition-colors cursor-pointer group"
          >
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Devil's Advocate</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
            <div className="text-xs font-bold text-stone-200">Pre-Mortem Failure Test</div>
            <p className="text-[11px] text-stone-400 mt-1 leading-snug">
              Simulate how the winning choice could fail and how to bulletproof it today.
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenScenarioSimulator}
            className="p-4 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-lg text-left transition-colors cursor-pointer group"
          >
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>What-If Simulator</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
            <div className="text-xs font-bold text-stone-200">Simulate External Shocks</div>
            <p className="text-[11px] text-stone-400 mt-1 leading-snug">
              Test how choices hold up against economic, personal, or timeline shifts.
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenCoinToss}
            className="p-4 bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-lg text-left transition-colors cursor-pointer group"
          >
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Gut Check Toss</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
            <div className="text-xs font-bold text-stone-200">Coin Flip Psychology</div>
            <p className="text-[11px] text-stone-400 mt-1 leading-snug">
              Flip a coin to discover what you secretly hoped for mid-air.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
