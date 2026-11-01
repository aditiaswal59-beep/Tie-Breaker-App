import React, { useState } from 'react';
import { Plus, CheckCircle2, XCircle, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { DecisionAnalysisResult, ProItem, ConItem } from '../types/decision';

interface ProsConsViewProps {
  analysis: DecisionAnalysisResult;
  onAddUserItem: (
    optionId: string,
    type: 'pro' | 'con',
    point: string,
    detail: string,
    impact: number
  ) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  analysis,
  onAddUserItem,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    analysis.options[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemModal, setNewItemModal] = useState<{
    optionId: string;
    type: 'pro' | 'con';
  } | null>(null);
  const [newPoint, setNewPoint] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newImpact, setNewImpact] = useState<number>(3);

  // Compute all unique categories across options
  const allCategories = React.useMemo(() => {
    const cats = new Set<string>();
    analysis.prosCons.forEach((pc) => {
      pc.pros.forEach((p) => p.category && cats.add(p.category));
      pc.cons.forEach((c) => c.category && cats.add(c.category));
    });
    return Array.from(cats);
  }, [analysis]);

  const activeOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];
  const activePC = analysis.prosCons.find((pc) => pc.optionId === selectedOptionId);

  const filteredPros = (activePC?.pros || []).filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );
  const filteredCons = (activePC?.cons || []).filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );

  const totalProScore = (activePC?.pros || []).reduce((acc, p) => acc + (p.impact || 1), 0);
  const totalConScore = (activePC?.cons || []).reduce((acc, c) => acc + Math.abs(c.impact || 1), 0);
  const netScore = totalProScore - totalConScore;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemModal || !newPoint.trim()) return;

    onAddUserItem(
      newItemModal.optionId,
      newItemModal.type,
      newPoint.trim(),
      newDetail.trim(),
      newItemModal.type === 'pro' ? Math.abs(newImpact) : -Math.abs(newImpact)
    );

    setNewItemModal(null);
    setNewPoint('');
    setNewDetail('');
  };

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto">
          {analysis.options.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
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

        {/* Category filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-500 font-medium">Filter Domain:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-md text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Option Tagline & Net Momentum */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
            Evaluating Thesis
          </span>
          <h3 className="text-base font-bold text-stone-900 mt-0.5">
            {activeOption?.name}: <span className="font-normal text-stone-600">{activeOption?.tagline}</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {activeOption?.keyTakeaway}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs">
          <div className="text-right">
            <span className="text-stone-500 block">Pro Momentum</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">+{totalProScore}</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="text-right">
            <span className="text-stone-500 block">Con Friction</span>
            <span className="font-mono font-bold text-rose-700 text-sm">-{totalConScore}</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="text-right">
            <span className="text-stone-500 block">Net Differential</span>
            <span
              className={`font-mono font-bold text-sm ${
                netScore > 0 ? 'text-emerald-700' : netScore < 0 ? 'text-rose-700' : 'text-stone-700'
              }`}
            >
              {netScore > 0 ? `+${netScore}` : netScore}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Pros vs Cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-stone-900">
                Advantages & Upside ({filteredPros.length})
              </h4>
            </div>
            <button
              onClick={() => setNewItemModal({ optionId: activeOption?.id || '', type: 'pro' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pro</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredPros.map((pro) => (
              <div
                key={pro.id}
                className="bg-white border border-stone-200 hover:border-emerald-200 rounded-lg p-4 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      {pro.category && <span className="font-medium text-stone-600">{pro.category}</span>}
                      {pro.category && <span aria-hidden="true">·</span>}
                      <span className="font-mono text-emerald-700 font-semibold">
                        Impact +{pro.impact}/5
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-stone-900">{pro.point}</h5>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{pro.detail}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredPros.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                No pros found in this filter category.
              </div>
            )}
          </div>
        </div>

        {/* Cons Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-stone-900">
                Drawbacks & Risks ({filteredCons.length})
              </h4>
            </div>
            <button
              onClick={() => setNewItemModal({ optionId: activeOption?.id || '', type: 'con' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Con</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredCons.map((con) => (
              <div
                key={con.id}
                className="bg-white border border-stone-200 hover:border-rose-200 rounded-lg p-4 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      {con.category && <span className="font-medium text-stone-600">{con.category}</span>}
                      {con.category && <span aria-hidden="true">·</span>}
                      <span className="font-mono text-rose-700 font-semibold">
                        Impact -{Math.abs(con.impact)}/5
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-stone-900">{con.point}</h5>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{con.detail}</p>

                    {con.mitigation && (
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-start gap-2 text-xs text-stone-600 bg-stone-50/70 p-2 rounded-md">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-stone-800 mr-1">Mitigation Strategy:</span>
                          <span>{con.mitigation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCons.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                No drawbacks found in this filter category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {newItemModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-xl p-6 max-w-md w-full shadow-lg">
            <h4 className="text-base font-bold text-stone-900 mb-1">
              Add Custom {newItemModal.type === 'pro' ? 'Advantage (Pro)' : 'Drawback (Con)'}
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              For option: <strong className="text-stone-800">{activeOption?.name}</strong>
            </p>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Point / Thesis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  placeholder={newItemModal.type === 'pro' ? 'e.g. Higher equity upside' : 'e.g. Higher commute fatigue'}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supporting Details / Context
                </label>
                <textarea
                  rows={2}
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  placeholder="Explain why this matters or how it will impact your daily reality..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Impact Weight: {newImpact} / 5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newImpact}
                  onChange={(e) => setNewImpact(parseInt(e.target.value, 10))}
                  className="w-full accent-stone-900"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>1 (Minor)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Crucial)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setNewItemModal(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-md"
                >
                  Add {newItemModal.type === 'pro' ? 'Pro' : 'Con'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
