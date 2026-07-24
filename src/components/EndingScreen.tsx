import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Heart } from 'lucide-react';
import { clearGameState } from '../utils/storage';

interface EndingScreenProps {
  fireflyCount: number;
  is100PercentComplete?: boolean;
  onReplay: () => void;
  onContinueExploring?: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  fireflyCount,
  is100PercentComplete = false,
  onReplay,
  onContinueExploring,
}) => {
  const [showText, setShowText] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Firefly golden confetti sparkles
    confetti({
      particleCount: is100PercentComplete ? 100 : 50,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#fef08a', '#fde047', '#fed7aa', '#c084fc', '#38bdf8'],
    });

    const timer1 = setTimeout(() => setShowText(true), 1500);
    const timer2 = setTimeout(() => setShowPrompt(true), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [is100PercentComplete]);

  const handleResetGame = () => {
    clearGameState();
    onReplay();
  };

  return (
    <div className="ending-overlay">
      {/* Golden Constellation Firefly Aura */}
      <div className="ending-aura animate-pulse" />

      {/* Main Poetic Message */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          className="ending-message-container text-center max-w-xl px-6"
        >
          {is100PercentComplete ? (
            <>
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/20 text-amber-300 mb-4 animate-bounce">
                <Heart size={28} />
              </div>
              <p className="ending-line text-amber-200 text-lg md:text-xl font-serif leading-relaxed">
                "Some stories aren't written because they're finished."
              </p>
              <p className="ending-line text-purple-200 text-lg md:text-xl font-serif mt-3 leading-relaxed">
                "They're written because someone wanted to remember."
              </p>

              <p className="firefly-stats-text mt-8 text-amber-300/80 font-mono text-xs">
                ✨ 100% Complete: You gathered all {fireflyCount} fireflies & every scattered diary page into the forest twilight.
              </p>
            </>
          ) : (
            <>
              <p className="ending-line text-amber-100 text-base md:text-lg font-serif italic leading-relaxed">
                "Maybe we never walked together."
              </p>
              <p className="ending-line text-purple-200 text-base md:text-lg font-serif italic mt-2 leading-relaxed">
                "Maybe life kept sending us on different roads."
              </p>
              <p className="ending-line text-amber-200 text-lg md:text-xl font-serif font-semibold mt-4 leading-relaxed">
                "But somehow... every path I walked had signs that you had been there first."
              </p>

              <p className="firefly-stats-text mt-8 text-purple-300/80 text-xs">
                ✨ You gathered {fireflyCount} fireflies into the forest twilight.
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Continuation Prompt & Credits Roll */}
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="credits-container text-center mt-10"
        >
          <div className="text-2xl font-serif font-bold text-amber-300 tracking-wider mb-2">
            Continue Tomorrow?
          </div>
          <p className="credits-subtitle text-xs text-purple-300/80">
            {is100PercentComplete
              ? 'The forest glows brightly forever in memory.'
              : 'The fireflies carry tiny fragments of your moments.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {onContinueExploring && (
              <button onClick={onContinueExploring} className="ui-btn-primary py-2.5 px-6 text-sm">
                <Sparkles size={16} /> Keep Exploring
              </button>
            )}
            <button onClick={handleResetGame} className="replay-btn py-2.5 px-6 text-sm">
              <RotateCcw size={16} /> Begin a New Journey
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
