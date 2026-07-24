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
        className="prologue-modal-card text-center max-w-lg"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 mb-4 animate-pulse">
          <Sparkles size={32} />
        </div>

        <h1 className="text-2xl font-serif text-amber-200 tracking-wide mb-1">
          The Firefly Diary
        </h1>
        <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mb-6">
          "Some people don't stay beside you all the time. Sometimes they stay inside the places they touched."
        </p>

        <div className="prologue-text-box font-serif text-slate-200 leading-relaxed text-sm md:text-base mb-8 space-y-3.5">
          <p>
            Long ago... this forest didn't exist. It was created by a single diary.
          </p>
          <p className="italic text-purple-200">
            Whenever something made someone smile, they wrote it down. Every tiny memory became a firefly.
          </p>
          <p className="text-slate-300 text-xs md:text-sm">
            Then life became louder. Conversations became shorter. "Tomorrow" quietly replaced "Today." Your job isn't saving the forest. Your job is remembering.
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
