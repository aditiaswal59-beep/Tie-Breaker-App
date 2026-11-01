import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, Shield, Zap } from 'lucide-react';
import { DecisionAnalysisResult, ScenarioSimulationResult } from '../types/decision';

interface ScenarioSimulatorModalProps {
  analysis: DecisionAnalysisResult;
  onClose: () => void;
}

const PRESET_SCENARIOS = [
  'Macro downturn or sudden 30% reduction in financial runway',
  'Severe personal burnout or requiring 50% fewer weekly hours',
  'A major new competitor or technological disruption emerges',
  'Unexpected life relocation or family obligation arises in 6 months',
];

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  analysis,
  onClose,
}) => {
  const [scenarioInput, setScenarioInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (scenarioText: string) => {
    if (!scenarioText.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma: analysis.decisionTitle,
          scenario: scenarioText.trim(),
          options: analysis.options.map((o) => o.name),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to simulate scenario.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-300 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              "What-If" Scenario Simulator
            </h3>
            <p className="text-xs text-stone-500">
              Inject external shocks or unexpected plot twists to see which option remains resilient.
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-3 my-4">
          <label className="block text-xs font-semibold text-stone-800">
            Describe the hypothetical shock:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              placeholder="e.g. What if interest rates hike 2%? Or: What if my spouse has to relocate?"
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <button
              onClick={() => handleSimulate(scenarioInput)}
              disabled={loading || !scenarioInput.trim()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading ? 'Simulating...' : 'Simulate'}
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-stone-400 self-center mr-1">Presets:</span>
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setScenarioInput(preset);
                  handleSimulate(preset);
                }}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors text-left"
              >
                {preset.slice(0, 38)}...
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-stone-600">
              Stress-testing options under simulated shock conditions...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 my-4">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4 my-4 text-xs text-stone-700">
            {/* Macro scenario synthesis */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                Scenario Impact Summary
              </span>
              <p className="text-blue-900 leading-relaxed font-medium">
                {result.scenarioImpact}
              </p>
            </div>

            {/* Option impact breakdown */}
            <div className="space-y-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Impact by Option
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.optionImpacts.map((imp, idx) => {
                  const isFavored = imp.impactLevel.toLowerCase().includes('favor');
                  const isHurt = imp.impactLevel.toLowerCase().includes('hurt');

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border space-y-1.5 ${
                        isFavored
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isHurt
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{imp.optionName}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isFavored
                              ? 'bg-emerald-100 text-emerald-800'
                              : isHurt
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {imp.impactLevel}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-[11px]">
                        {imp.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Updated recommendation */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                Under This Scenario: Updated Recommendation
              </span>
              <p className="text-amber-900 font-semibold leading-relaxed">
                {result.newRecommendation}
              </p>
            </div>

            {/* Hedging strategy */}
            <div className="flex items-start gap-2.5 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
              <Shield className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block text-[11px] mb-0.5">
                  Universal Hedging Strategy (Downside Insurance)
                </span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {result.hedgingStrategy}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
