import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Layers,
  Table,
  Grid2X2,
  SlidersHorizontal,
  Award,
  AlertCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Header } from './components/Header';
import { DecisionForm } from './components/DecisionForm';
import { AnalysisOverview } from './components/AnalysisOverview';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { SwotView } from './components/SwotView';
import { WeightedScorecardView } from './components/WeightedScorecardView';
import { TiebreakerVerdictView } from './components/TiebreakerVerdictView';
import { DevilsAdvocateModal } from './components/DevilsAdvocateModal';
import { ScenarioSimulatorModal } from './components/ScenarioSimulatorModal';
import { CoinTossModal } from './components/CoinTossModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DecisionAnalysisResult, SavedDecision } from './types/decision';
import { SampleDilemma, SAMPLE_DILEMMAS } from './data/samples';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions_v1';

export default function App() {
  const [activeDecision, setActiveDecision] = useState<DecisionAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'verdict' | 'proscons' | 'matrix' | 'swot' | 'scorecard'>('verdict');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDevilsAdvocateOpen, setIsDevilsAdvocateOpen] = useState(false);
  const [isScenarioSimulatorOpen, setIsScenarioSimulatorOpen] = useState(false);
  const [isCoinTossOpen, setIsCoinTossOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Saved Decisions in LocalStorage
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDecisions));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [savedDecisions]);

  const handleAnalyzeDecision = async (formData: {
    dilemma: string;
    options: string[];
    priorities: string;
    context: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma: formData.dilemma,
          optionsInput: formData.options.length > 0 ? formData.options : undefined,
          priorities: formData.priorities || undefined,
          userContext: formData.context || undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to analyze decision.');
      }

      const result: DecisionAnalysisResult = await response.json();
      result.id = 'dec_' + Date.now();
      result.createdAt = new Date().toISOString();

      setActiveDecision(result);
      setActiveTab('verdict');

      // Save to archive
      const newSavedItem: SavedDecision = {
        id: result.id,
        timestamp: result.createdAt,
        dilemma: formData.dilemma,
        result,
      };

      setSavedDecisions((prev) => [newSavedItem, ...prev.filter((item) => item.dilemma !== formData.dilemma)]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An unexpected error occurred while analyzing the decision.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDecision = () => {
    setActiveDecision(null);
    setError(null);
  };

  const handleAddUserItem = (
    optionId: string,
    type: 'pro' | 'con',
    point: string,
    detail: string,
    impact: number
  ) => {
    if (!activeDecision) return;

    const updatedPC = activeDecision.prosCons.map((pc) => {
      if (pc.optionId !== optionId) return pc;

      if (type === 'pro') {
        const newPro = {
          id: 'user_pro_' + Date.now(),
          point,
          detail,
          category: 'User Added',
          impact,
        };
        return { ...pc, pros: [...pc.pros, newPro] };
      } else {
        const newCon = {
          id: 'user_con_' + Date.now(),
          point,
          detail,
          category: 'User Added',
          impact,
          mitigation: 'Monitor and set clear boundaries.',
        };
        return { ...pc, cons: [...pc.cons, newCon] };
      }
    });

    const updatedDecision = {
      ...activeDecision,
      prosCons: updatedPC,
    };

    setActiveDecision(updatedDecision);

    // Update in savedDecisions
    if (activeDecision.id) {
      setSavedDecisions((prev) =>
        prev.map((item) =>
          item.id === activeDecision.id ? { ...item, result: updatedDecision } : item
        )
      );
    }
  };

  const handleSelectPastDecision = (saved: SavedDecision) => {
    setActiveDecision(saved.result);
    setActiveTab('verdict');
    setError(null);
  };

  const handleDeletePastDecision = (id: string) => {
    setSavedDecisions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your decision archive?')) {
      setSavedDecisions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCopySummary = () => {
    if (!activeDecision) return;
    const recOpt = activeDecision.options.find(
      (o) => o.id === activeDecision.tiebreakerVerdict.recommendedOptionId
    );

    const summaryText = `THE TIEBREAKER — DECISION SUMMARY
Dilemma: ${activeDecision.decisionTitle}
Reversibility: ${activeDecision.reversibility}

RECOMMENDATION: ${recOpt?.name || 'Top Option'}
"${activeDecision.tiebreakerVerdict.headline}"

REASONING:
${activeDecision.tiebreakerVerdict.reasoning}

RULES OF THUMB:
${activeDecision.tiebreakerVerdict.rulesOfThumb.map((r) => `- ${r.condition}`).join('\n')}

COGNITIVE BLINDSPOT:
${activeDecision.tiebreakerVerdict.blindspot}

48-HOUR EXPERIMENT:
${activeDecision.tiebreakerVerdict.immediateNextStep}
`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Header
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedDecisions.length}
        hasActiveDecision={Boolean(activeDecision)}
        onLoadSample={() => {
          handleAnalyzeDecision({
            dilemma: SAMPLE_DILEMMAS[0].dilemma,
            options: SAMPLE_DILEMMAS[0].options,
            priorities: SAMPLE_DILEMMAS[0].priorities,
            context: SAMPLE_DILEMMAS[0].context,
          });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Error analyzing decision:</span> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!activeDecision ? (
          <DecisionForm
            onSubmit={handleAnalyzeDecision}
            isLoading={isLoading}
            onSelectSample={(sample) => {
              // The form pre-fills with sample fields
            }}
          />
        ) : (
          <div className="space-y-6">
            <AnalysisOverview
              analysis={activeDecision}
              onOpenCoinToss={() => setIsCoinTossOpen(true)}
              onPrint={handlePrint}
              onCopySummary={handleCopySummary}
              copied={copied}
            />

            {/* Navigation Tabs (Functional Segmented Control) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('verdict')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'verdict'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>The Verdict</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('proscons')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'proscons'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-stone-600" />
                  <span>Pros & Cons List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Table className="w-3.5 h-3.5 text-stone-600" />
                  <span>Comparison Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('swot')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'swot'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Grid2X2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>SWOT Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('scorecard')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'scorecard'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
                  <span>Weighted Scorecard</span>
                </button>
              </div>

              {/* View Container */}
              <div className="mt-6">
                {activeTab === 'verdict' && (
                  <TiebreakerVerdictView
                    analysis={activeDecision}
                    onOpenDevilsAdvocate={() => setIsDevilsAdvocateOpen(true)}
                    onOpenScenarioSimulator={() => setIsScenarioSimulatorOpen(true)}
                    onOpenCoinToss={() => setIsCoinTossOpen(true)}
                  />
                )}

                {activeTab === 'proscons' && (
                  <ProsConsView
                    analysis={activeDecision}
                    onAddUserItem={handleAddUserItem}
                  />
                )}

                {activeTab === 'matrix' && (
                  <ComparisonMatrixView analysis={activeDecision} />
                )}

                {activeTab === 'swot' && (
                  <SwotView analysis={activeDecision} />
                )}

                {activeTab === 'scorecard' && (
                  <WeightedScorecardView analysis={activeDecision} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">The Tiebreaker</span>
            <span>·</span>
            <span>Rigorous Decision Architecture</span>
          </div>
          <div className="text-stone-400">
            Powered by Gemini 3.8 Flash · Behavioral economics & regret minimization
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={handleSelectPastDecision}
        onDeleteDecision={handleDeletePastDecision}
        onClearAll={handleClearAllHistory}
      />

      {isDevilsAdvocateOpen && activeDecision && (
        <DevilsAdvocateModal
          analysis={activeDecision}
          onClose={() => setIsDevilsAdvocateOpen(false)}
        />
      )}

      {isScenarioSimulatorOpen && activeDecision && (
        <ScenarioSimulatorModal
          analysis={activeDecision}
          onClose={() => setIsScenarioSimulatorOpen(false)}
        />
      )}

      {isCoinTossOpen && activeDecision && (
        <CoinTossModal
          analysis={activeDecision}
          onClose={() => setIsCoinTossOpen(false)}
        />
      )}
    </div>
  );
}
