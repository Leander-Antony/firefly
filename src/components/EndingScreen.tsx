import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { clearGameState } from '../utils/storage';

interface EndingScreenProps {
  fireflyCount: number;
  onReplay: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ fireflyCount, onReplay }) => {
  const [showText, setShowText] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    // Firefly golden confetti sparkles
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#fef08a', '#fde047', '#fed7aa', '#c084fc'],
    });

    const timer1 = setTimeout(() => setShowText(true), 2000);
    const timer2 = setTimeout(() => setShowCredits(true), 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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
          transition={{ duration: 2.5 }}
          className="ending-message-container"
        >
          <p className="ending-line text-amber-200">Some memories are too small to notice.</p>
          <p className="ending-line text-purple-200 mt-4">Some people become them.</p>

          <p className="firefly-stats-text mt-8">
            ✨ You gathered {fireflyCount} fireflies into the forest twilight.
          </p>
        </motion.div>
      )}

      {/* Credits Roll */}
      {showCredits && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="credits-container"
        >
          <div className="credits-title flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-amber-300" />
            <span>FIREFLY DIARIES</span>
          </div>
          <p className="credits-subtitle">A journey of quiet moments, reflection, and tiny discoveries.</p>

          <div className="credits-roles mt-6">
            <div>Game & Narrative Design</div>
            <div className="text-purple-200">Firefly Diaries Team</div>
            <div className="mt-3">Art & Audio Engine</div>
            <div className="text-purple-200">Procedural Vector & Web Audio Synth</div>
          </div>

          <button onClick={handleResetGame} className="replay-btn mt-8">
            <RotateCcw size={16} /> Begin a New Journey
          </button>
        </motion.div>
      )}
    </div>
  );
};
