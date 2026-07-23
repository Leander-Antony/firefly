import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';

interface PrologueCutsceneProps {
  onStart: () => void;
}

export const PrologueCutscene: React.FC<PrologueCutsceneProps> = ({ onStart }) => {
  const handleBegin = () => {
    SoundEngine.init();
    SoundEngine.playFireflyCollect();
    onStart();
  };

  return (
    <div className="modal-backdrop z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="prologue-modal-card text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 mb-4 animate-pulse">
          <Sparkles size={32} />
        </div>

        <h1 className="text-2xl font-serif text-amber-200 tracking-wide mb-1">
          Firefly Diaries
        </h1>
        <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mb-6">
          The Lost Guardian's Tale
        </p>

        <div className="prologue-text-box font-serif text-slate-200 leading-relaxed text-sm md:text-base mb-8 space-y-4">
          <p>
            You wake up at twilight on the edge of a quiet, forgotten forest.
          </p>
          <p className="italic text-purple-200">
            In your hand is an old iron lantern, and resting upon a wooden guidepost is Evelyn's lost diary...
          </p>
          <p className="text-slate-300 text-xs md:text-sm">
            Follow the luminous fireflies and story waypoints to piece together the memories of those who walked these paths before you.
          </p>
        </div>

        <button
          onClick={handleBegin}
          className="ui-btn-primary flex items-center justify-center gap-2 mx-auto px-8 py-3 text-base font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Compass size={20} /> Begin Journey
        </button>
      </motion.div>
    </div>
  );
};
