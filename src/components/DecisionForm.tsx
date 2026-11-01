import React, { useState } from 'react';
import { Scale, Sparkles, Plus, Trash2, Sliders, ChevronDown, ChevronUp, ArrowRight, Lightbulb } from 'lucide-react';
import { SAMPLE_DILEMMAS, SampleDilemma } from '../data/samples';

interface DecisionFormProps {
  onSubmit: (formData: {
    dilemma: string;
    options: string[];
    priorities: string;
    context: string;
  }) => Promise<void>;
  isLoading: boolean;
  onSelectSample: (sample: SampleDilemma) => void;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  isLoading,
  onSelectSample,
}) => {
  const [dilemma, setDilemma] = useState('');
  const [customOptions, setCustomOptions] = useState<string[]>(['', '']);
  const [hasExplicitOptions, setHasExplicitOptions] = useState(false);
  const [priorities, setPriorities] = useState('');
  const [context, setContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddOption = () => {
    if (customOptions.length < 4) {
      setCustomOptions([...customOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (customOptions.length > 2) {
      setCustomOptions(customOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...customOptions];
    updated[index] = val;
    setCustomOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemma.trim() || isLoading) return;

    const filteredOptions = hasExplicitOptions
      ? customOptions.map((o) => o.trim()).filter((o) => o.length > 0)
      : [];

    await onSubmit({
      dilemma: dilemma.trim(),
      options: filteredOptions,
      priorities: priorities.trim(),
      context: context.trim(),
    });
  };

  const applySample = (sample: SampleDilemma) => {
    setDilemma(sample.dilemma);
    setHasExplicitOptions(true);
    setCustomOptions(sample.options);
    setPriorities(sample.priorities);
    setContext(sample.context);
    setShowAdvanced(true);
    onSelectSample(sample);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 mb-3">
          Stop Overthinking. Break the Tie.
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Frame your dilemma and get an objective, multi-angle breakdown: structured pros & cons,
          a side-by-side comparison matrix, strategic SWOT analysis, and a definitive tie-breaking verdict.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="dilemma" className="block text-sm font-semibold text-stone-900 mb-2">
              What decision do you need to make? <span className="text-amber-600">*</span>
            </label>
            <textarea
              id="dilemma"
              rows={3}
              required
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              placeholder="e.g. Should I accept the senior role at an early-stage startup or stay in my corporate tech job? Or: Should we buy a suburban house or keep renting in the city?"
              className="w-full px-4 py-3 text-stone-900 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Option Mode Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-stone-800">Do you have specific options in mind?</span>
              <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setHasExplicitOptions(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    !hasExplicitOptions
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Let AI Formulate Options
                </button>
                <button
                  type="button"
                  onClick={() => setHasExplicitOptions(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    hasExplicitOptions
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  I'll Specify Options
                </button>
              </div>
            </div>

            {hasExplicitOptions && (
              <div className="space-y-3 mt-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-xs text-stone-500 mb-2">
                  List 2 to 4 options you are weighing against each other:
                </p>
                {customOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-mono font-medium text-stone-500 text-center">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g. ${
                        idx === 0 ? 'Accept the Startup Job' : idx === 1 ? 'Stay at Corporate Role' : 'Take a Sabbatical'
                      })`}
                      className="flex-1 px-3 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800"
                    />
                    {customOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-2 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {customOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add another option</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Advanced Constraints & Context */}
          <div className="border-t border-stone-100 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-medium text-stone-600 hover:text-stone-900 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Fine-tune Priorities & Context (Optional)</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <label htmlFor="priorities" className="block text-xs font-medium text-stone-700 mb-1">
                    Your Core Priorities & Non-Negotiables
                  </label>
                  <input
                    id="priorities"
                    type="text"
                    value={priorities}
                    onChange={(e) => setPriorities(e.target.value)}
                    placeholder="e.g. Work-life balance, maximum upside, low risk, 6-month timeline"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
                <div>
                  <label htmlFor="context" className="block text-xs font-medium text-stone-700 mb-1">
                    Background Context or Constraints
                  </label>
                  <input
                    id="context"
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. 2 young kids, comfortable savings, partner is fully supportive"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading || !dilemma.trim()}
              className="w-full py-3.5 px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-amber-400 rounded-full animate-spin" />
                  <span>Synthesizing Decision Landscape...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Analyze & Break The Tie</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preset Inspirations */}
      <div className="mt-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-3 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Or explore realistic dilemmas:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_DILEMMAS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => applySample(sample)}
              className="text-left p-3.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span>{sample.category}</span>
                <span className="text-stone-300 group-hover:text-stone-600 transition-colors">Load &rarr;</span>
              </div>
              <h4 className="text-sm font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                {sample.title}
              </h4>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {sample.dilemma}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
