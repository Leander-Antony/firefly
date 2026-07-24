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
          The Fireflies Remember
        </h1>
        <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mb-6">
          "Some people don't stay beside you all the time. Sometimes they stay inside the places they touched."
        </p>

        <div className="prologue-text-box font-serif text-slate-200 leading-relaxed text-sm md:text-base mb-8 space-y-4">
          <p>
            Long ago, two travelers walked these woods. One always walked during sunrise; the other always walked after sunset.
          </p>
          <p className="italic text-purple-200">
            They almost never met... yet left tiny surprises, notes, and firefly memories for each other across the forest.
          </p>
          <p className="text-slate-300 text-xs md:text-sm">
            Now the forest fireflies are losing their light and the diary has scattered. Wake up as the forest spirit and gather every forgotten page before the final light fades.
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
