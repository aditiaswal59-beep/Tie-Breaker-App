import React from 'react';
import { Award, Info, Check, HelpCircle } from 'lucide-react';
import { DecisionAnalysisResult } from '../types/decision';

interface ComparisonMatrixViewProps {
  analysis: DecisionAnalysisResult;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({ analysis }) => {
  const { options, matrix } = analysis;

  // Calculate total scores per option
  const totalScores = React.useMemo(() => {
    const totals: Record<string, number> = {};
    options.forEach((opt) => (totals[opt.id] = 0));

    matrix.criteria.forEach((criterion) => {
      criterion.evaluations.forEach((ev) => {
        if (totals[ev.optionId] !== undefined) {
          totals[ev.optionId] += ev.score;
        }
      });
    });
    return totals;
  }, [options, matrix]);

  // Find max score among options to highlight overall leader
  const maxTotalScore = Math.max(...Object.values(totalScores), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Multi-Criteria Decision Matrix
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Direct side-by-side evaluation across core decision criteria (scored 1–10).
          </p>
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Scores reflect calibrated evidence and trade-offs</span>
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-stone-500 w-1/3 min-w-[240px]">
                Evaluation Criterion
              </th>
              {options.map((opt, idx) => (
                <th
                  key={opt.id}
                  className="py-3.5 px-4 text-xs font-semibold text-stone-900 border-l border-stone-200 min-w-[220px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-stone-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="truncate">{opt.name}</span>
                  </div>
                  <span className="block text-[11px] font-normal text-stone-500 truncate mt-0.5">
                    {opt.tagline}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200 text-xs">
            {matrix.criteria.map((criterion) => {
              // find max score for this criterion
              const criterionScores = criterion.evaluations.map((e) => e.score);
              const maxCriterionScore = Math.max(...criterionScores, -1);

              return (
                <tr key={criterion.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-4 align-top">
                    <div className="font-semibold text-stone-900 text-sm">{criterion.name}</div>
                    <div className="text-stone-500 mt-1 leading-relaxed">
                      {criterion.description}
                    </div>
                    <div className="mt-2 text-[11px] text-stone-400 font-mono">
                      Baseline Weight: {criterion.defaultWeight}x
                    </div>
                  </td>

                  {options.map((opt) => {
                    const evalItem = criterion.evaluations.find((e) => e.optionId === opt.id);
                    const isWinner = evalItem && evalItem.score === maxCriterionScore && evalItem.score > 0;
                    const score = evalItem?.score || 0;

                    return (
                      <td
                        key={opt.id}
                        className={`py-4 px-4 align-top border-l border-stone-200 ${
                          isWinner ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-base text-stone-900">
                              {score}
                            </span>
                            <span className="text-stone-400 font-mono text-[11px]">/10</span>
                          </div>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                              <Check className="w-3 h-3 text-amber-600" />
                              <span>Leads</span>
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              score >= 8
                                ? 'bg-emerald-600'
                                : score >= 5
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(score * 10, 100)}%` }}
                          />
                        </div>

                        <p className="text-stone-600 leading-relaxed text-xs">
                          {evalItem?.comment || '—'}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Total Unweighted Score */}
          <tfoot>
            <tr className="bg-stone-50 border-t-2 border-stone-300">
              <td className="py-4 px-4 text-xs font-bold text-stone-900 uppercase tracking-wider">
                Total Criteria Score
              </td>
              {options.map((opt) => {
                const total = totalScores[opt.id] || 0;
                const isLeader = total === maxTotalScore && total > 0;

                return (
                  <td key={opt.id} className="py-4 px-4 border-l border-stone-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-lg text-stone-900">{total}</span>
                        <span className="text-stone-400 font-mono text-xs ml-1">
                          pts (avg {(total / Math.max(matrix.criteria.length, 1)).toFixed(1)})
                        </span>
                      </div>
                      {isLeader && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Highest Aggregate</span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
