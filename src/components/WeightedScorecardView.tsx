import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, RotateCcw, Trophy, CheckCircle, TrendingUp } from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

interface WeightedScorecardViewProps {
  analysis: DecisionAnalysisResult;
}

export const WeightedScorecardView: React.FC<WeightedScorecardViewProps> = ({ analysis }) => {
  const { options, matrix } = analysis;

  // Initialize weights state from criterion default weights
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    matrix.criteria.forEach((c) => {
      initial[c.id] = c.defaultWeight || 3;
    });
    return initial;
  });

  const handleWeightChange = (criterionId: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [criterionId]: value,
    }));
  };

  const handleResetWeights = () => {
    const reset: Record<string, number> = {};
    matrix.criteria.forEach((c) => {
      reset[c.id] = c.defaultWeight || 3;
    });
    setWeights(reset);
  };

  // Compute weighted totals and normalized scores (out of 10)
  const scoreResults = useMemo(() => {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    const totals: Record<string, { raw: number; normalized: number }> = {};

    options.forEach((opt) => {
      let rawSum = 0;
      matrix.criteria.forEach((criterion) => {
        const w = weights[criterion.id] ?? 3;
        const evalItem = criterion.evaluations.find((e) => e.optionId === opt.id);
        const score = evalItem ? evalItem.score : 0;
        rawSum += score * w;
      });

      totals[opt.id] = {
        raw: rawSum,
        normalized: parseFloat((rawSum / totalWeight).toFixed(2)),
      };
    });

    // Rank options
    const ranked = [...options].sort((a, b) => {
      return (totals[b.id]?.raw || 0) - (totals[a.id]?.raw || 0);
    });

    return { totals, ranked, totalWeight };
  }, [options, matrix, weights]);

  const winner = scoreResults.ranked[0];
  const runnerUp = scoreResults.ranked[1];
  const leadMargin =
    runnerUp && scoreResults.totals[winner.id] && scoreResults.totals[runnerUp.id]
      ? (
          ((scoreResults.totals[winner.id].raw - scoreResults.totals[runnerUp.id].raw) /
            Math.max(scoreResults.totals[runnerUp.id].raw, 1)) *
          100
        ).toFixed(1)
      : '0';

  return (
    <div className="space-y-8">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Interactive Weighted Scorecard
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Decisions aren't made in a vacuum. Adjust how much each criterion matters to YOU personally.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Dynamic Results Leaderboard */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-850 text-white rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-700/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>Personalized Mathematical Leader</span>
            </div>
            <h4 className="text-2xl font-bold text-stone-100">
              {winner.name}
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              {winner.tagline}
            </p>
          </div>

          {runnerUp && (
            <div className="bg-stone-800/80 border border-stone-700 rounded-lg px-4 py-2 text-xs">
              <span className="text-stone-400 block">Competitive Margin</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                +{leadMargin}% ahead of {runnerUp.name}
              </span>
            </div>
          )}
        </div>

        {/* Ranked Bars */}
        <div className="space-y-3">
          {scoreResults.ranked.map((opt, rankIdx) => {
            const result = scoreResults.totals[opt.id];
            const isFirst = rankIdx === 0;
            const percentage = Math.min((result.normalized / 10) * 100, 100);

            return (
              <div key={opt.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono font-bold text-stone-400">
                      #{rankIdx + 1}
                    </span>
                    <span className="font-semibold text-stone-200">{opt.name}</span>
                    {isFirst && (
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded">
                        Top Fit
                      </span>
                    )}
                  </div>
                  <div className="font-mono">
                    <span className="text-base font-bold text-stone-100">
                      {result.normalized}
                    </span>
                    <span className="text-stone-400 text-xs"> / 10</span>
                    <span className="text-stone-500 text-[11px] ml-2">
                      ({result.raw} weighted pts)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFirst ? 'bg-amber-400' : 'bg-stone-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Criteria Weight Sliders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-700" />
            <span>Customize Your Weightings</span>
          </h4>
          <span className="text-xs text-stone-500 font-mono">
            Total Combined Weight: {scoreResults.totalWeight}x
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matrix.criteria.map((criterion) => {
            const currentWeight = weights[criterion.id] ?? 3;

            return (
              <div
                key={criterion.id}
                className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">{criterion.name}</h5>
                    <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      {currentWeight}x
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(criterion.id, parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                    <span>1x (Minor)</span>
                    <span>2x (Low)</span>
                    <span>3x (Standard)</span>
                    <span>4x (High)</span>
                    <span>5x (Essential)</span>
                  </div>
                </div>

                {/* Quick breakdown of how options perform on this criterion */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                  {options.map((opt) => {
                    const evalItem = criterion.evaluations.find((e) => e.optionId === opt.id);
                    return (
                      <span key={opt.id}>
                        <strong className="text-stone-800">{opt.name.split(' ')[0]}:</strong>{' '}
                        <span className="font-mono font-medium">{evalItem?.score || 0}/10</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
