import React, { useState } from 'react';
import { X, Coins, Sparkles, RefreshCw, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecisionAnalysisResult } from '../types/decision';

interface CoinTossModalProps {
  analysis: DecisionAnalysisResult;
  onClose: () => void;
}

export const CoinTossModal: React.FC<CoinTossModalProps> = ({ analysis, onClose }) => {
  const { options } = analysis;
  const optA = options[0] || { name: 'Option A' };
  const optB = options[1] || { name: 'Option B' };

  const [isFlipping, setIsFlipping] = useState(false);
  const [resultSide, setResultSide] = useState<'heads' | 'tails' | null>(null);
  const [flipCount, setFlipCount] = useState(0);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResultSide(null);

    // Audio cue using Web Audio API synthesis
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio optional
    }

    // Determine random outcome
    const outcome = Math.random() > 0.5 ? 'heads' : 'tails';

    setTimeout(() => {
      setResultSide(outcome);
      setIsFlipping(false);
      setFlipCount((prev) => prev + 1);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#b45309', '#10b981'],
        });
      } catch (e) {
        // Confetti optional
      }
    }, 1200);
  };

  const winningOption = resultSide === 'heads' ? optA : optB;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-900 mb-3">
          <Coins className="w-6 h-6 text-amber-700" />
        </div>

        <h3 className="text-xl font-bold text-stone-900">
          The Coin Flip Gut Check
        </h3>

        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
          Sigmund Freud’s famous rule of thumb: You don’t flip the coin to decide for you. You flip it because{' '}
          <strong className="text-stone-800 font-semibold">while the coin is in the air</strong>, your subconscious
          instinctively knows which side it is secretly rooting for.
        </p>

        {/* Option Mapping */}
        <div className="my-6 grid grid-cols-2 gap-3 text-xs">
          <div
            className={`p-3 rounded-xl border transition-all ${
              resultSide === 'heads'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
              HEADS
            </span>
            <span className="font-bold text-stone-900 block truncate">{optA.name}</span>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              resultSide === 'tails'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
              TAILS
            </span>
            <span className="font-bold text-stone-900 block truncate">{optB.name}</span>
          </div>
        </div>

        {/* The Animated Coin */}
        <div className="my-8 flex justify-center items-center h-28">
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-4 border-amber-600 shadow-lg flex items-center justify-center select-none transition-transform duration-700 ${
              isFlipping ? 'animate-bounce scale-110' : ''
            }`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
              transform: isFlipping ? 'rotateY(720deg)' : 'none',
            }}
          >
            <div className="w-18 h-18 rounded-full border-2 border-dashed border-amber-600/40 flex flex-col items-center justify-center font-bold text-stone-900 font-mono">
              {isFlipping ? (
                <span className="text-sm font-semibold tracking-widest text-amber-950">FLIPPING</span>
              ) : resultSide ? (
                <>
                  <span className="text-base font-extrabold text-amber-950 uppercase">
                    {resultSide}
                  </span>
                  <span className="text-[10px] text-amber-900 uppercase">
                    {resultSide === 'heads' ? 'Opt A' : 'Opt B'}
                  </span>
                </>
              ) : (
                <Coins className="w-8 h-8 text-amber-900/80" />
              )}
            </div>
          </div>
        </div>

        {/* Result Message */}
        {resultSide && !isFlipping && (
          <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl text-left space-y-1.5 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Result: Landed on {resultSide.toUpperCase()} ({winningOption.name})</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Now notice what happened in your body: Did you feel a quiet wave of{' '}
              <strong className="text-stone-900">relief</strong>, or a flicker of{' '}
              <strong className="text-stone-900">disappointment</strong>? If you felt disappointed, pick the opposite
              option.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleFlip}
            disabled={isFlipping}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFlipping ? 'animate-spin' : ''}`} />
            <span>{flipCount === 0 ? 'Toss The Coin' : 'Flip Again'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            I Have My Answer
          </button>
        </div>
      </div>
    </div>
  );
};
