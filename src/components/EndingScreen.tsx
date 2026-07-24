import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Heart, Flame } from 'lucide-react';
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
  const [showSecondLanternScene, setShowSecondLanternScene] = useState(false);

  useEffect(() => {
    // Firefly golden confetti sparkles
    confetti({
      particleCount: is100PercentComplete ? 120 : 60,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#fef08a', '#fde047', '#fed7aa', '#c084fc', '#38bdf8'],
    });

    const timer1 = setTimeout(() => setShowText(true), 1500);
    const timer2 = setTimeout(() => setShowPrompt(true), 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [is100PercentComplete]);

  const handleResetGame = () => {
    clearGameState();
    onReplay();
  };

  const handleContinueWalking = () => {
    setShowSecondLanternScene(true);
  };

  return (
    <div className="ending-overlay">
      {/* Golden Constellation Firefly Aura */}
      <div className="ending-aura animate-pulse" />

      {/* Post-Credits Scene: Second Lantern beside Player */}
      {showSecondLanternScene ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="text-center max-w-lg px-6 flex flex-col items-center justify-center space-y-8 z-50"
        >
          {/* Two Glowing Lanterns in Moss */}
          <div className="flex items-center justify-center gap-12 my-6">
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-2xl animate-pulse">
                <Flame size={36} />
              </div>
              <span className="text-[11px] text-amber-300/60 font-mono mt-2">First Lantern</span>
            </div>

            <div className="h-12 w-px bg-purple-500/30" />

            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-2xl animate-pulse">
                <Flame size={36} />
              </div>
              <span className="text-[11px] text-purple-300/60 font-mono mt-2">Second Lantern</span>
            </div>
          </div>

          <p className="text-sm font-serif italic text-purple-200/90 leading-relaxed">
            A second glowing lantern rests quietly beside you in the moss.
          </p>

          <button
            onClick={() => {
              if (onContinueExploring) onContinueExploring();
            }}
            className="ui-btn-primary py-3 px-8 text-base font-semibold rounded-full shadow-xl"
          >
            Continue Walking?
          </button>
        </motion.div>
      ) : (
        <>
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
                  <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-amber-500/20 text-amber-300 mb-6 animate-bounce">
                    <Heart size={32} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 tracking-wide mb-4">
                    Thank you.
                  </h2>
                  <p className="text-xl font-serif text-purple-200 italic tracking-wide">
                    For remembering.
                  </p>

                  <p className="firefly-stats-text mt-8 text-amber-300/80 font-mono text-xs">
                    ✨ 100% Secret Unlocked: You remembered every tiny moment in the forest twilight.
                  </p>
                </>
              ) : (
                <>
                  <p className="ending-line text-amber-100 text-base md:text-lg font-serif italic leading-relaxed">
                    Some people become your biggest chapter.
                  </p>
                  <p className="ending-line text-purple-200 text-base md:text-lg font-serif italic mt-1 leading-relaxed">
                    Some become the spaces between chapters.
                  </p>
                  <div className="my-4 text-xs font-mono text-amber-300/80 uppercase tracking-widest space-x-2">
                    <span>Coffee.</span>
                    <span>Books.</span>
                    <span>Waiting.</span>
                    <span>Learning.</span>
                    <span>Stupid jokes.</span>
                    <span>Fireflies.</span>
                  </div>
                  <p className="ending-line text-amber-200 text-lg md:text-xl font-serif font-semibold mt-4 leading-relaxed">
                    Maybe memories don't become important because they're big.
                  </p>
                  <p className="ending-line text-purple-200 text-lg md:text-xl font-serif italic mt-1 leading-relaxed">
                    Maybe they become important because someone remembers them.
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
                  ? 'The forest remembers every moment.'
                  : 'The fireflies carry tiny fragments of your moments.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <button onClick={handleContinueWalking} className="ui-btn-primary py-2.5 px-6 text-sm">
                  <Sparkles size={16} /> Continue Walking?
                </button>
                <button onClick={handleResetGame} className="replay-btn py-2.5 px-6 text-sm">
                  <RotateCcw size={16} /> Begin a New Journey
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
