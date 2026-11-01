import React from 'react';
import { X, History, Trash2, ArrowRight, DoorClosed, Calendar, Scale } from 'lucide-react';
import { SavedDecision } from '../types/decision';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: SavedDecision[];
  onSelectDecision: (decision: SavedDecision) => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">Decision Archive</h3>
            <span className="text-xs font-mono text-stone-500">({savedDecisions.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-16 space-y-2 text-stone-400">
              <Scale className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-medium text-stone-600">No decisions saved yet.</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                Any decision you analyze will automatically be saved here so you can review your reasoning later.
              </p>
            </div>
          ) : (
            savedDecisions.map((item) => {
              const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const recOpt = item.result.options.find(
                (o) => o.id === item.result.tiebreakerVerdict.recommendedOptionId
              );

              return (
                <div
                  key={item.id}
                  className="p-4 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {formattedDate}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(item.id);
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete saved decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                    {item.result.decisionTitle || item.dilemma}
                  </h4>

                  <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 mr-1">Verdict:</span>
                      <strong className="text-stone-800">{recOpt?.name || 'Selected'}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectDecision(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {savedDecisions.length > 0 && (
          <div className="p-4 border-t border-stone-200 flex justify-between items-center bg-stone-50">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
            >
              Clear All History
            </button>
            <span className="text-[11px] text-stone-400 font-mono">
              Stored locally on device
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
