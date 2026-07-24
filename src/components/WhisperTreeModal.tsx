import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Wind, BookMarked, X } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';

interface WhisperTreeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const WhisperTreeModal: React.FC<WhisperTreeModalProps> = ({ engine, onClose }) => {
  const [text, setText] = useState('');
  const [actionState, setActionState] = useState<'idle' | 'burning' | 'blowing'>('idle');

  const handleKeep = () => {
    if (!text.trim()) return;
    engine.savedState.keptWhisperNotes.unshift({
      id: `whisper_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      content: text,
    });
    saveGameState(engine.savedState);
    SoundEngine.playPageFlip();
    onClose();
  };

  const handleBurn = () => {
    if (!text.trim()) return;
    setActionState('burning');
    SoundEngine.playFireflyCollect();
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleThrowToWind = () => {
    if (!text.trim()) return;
    setActionState('blowing');
    SoundEngine.playFireflyCollect();
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="whisper-modal-card relative overflow-hidden"
      >
        <button onClick={onClose} className="close-btn absolute top-4 right-4 z-30">
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/50 text-purple-300 mb-2">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-serif text-purple-100">The Whisper Tree</h2>
          <p className="text-xs text-purple-300/80 italic mt-1 max-w-sm mx-auto">
            "Some words are not ready for another heart. Leave them here. The forest keeps promises."
          </p>
        </div>

        <AnimatePresence mode="wait">
          {actionState === 'idle' && (
            <motion.div key="input-form" exit={{ opacity: 0 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write whatever is on your mind..."
                className="whisper-textarea"
                rows={5}
                autoFocus
              />

              <div className="whisper-actions">
                <button
                  onClick={handleKeep}
                  disabled={!text.trim()}
                  className="whisper-btn btn-keep"
                >
                  <BookMarked size={16} /> Keep (Save)
                </button>
                <button
                  onClick={handleThrowToWind}
                  disabled={!text.trim()}
                  className="whisper-btn btn-wind"
                >
                  <Wind size={16} /> Whisper to Wind
                </button>
                <button
                  onClick={handleBurn}
                  disabled={!text.trim()}
                  className="whisper-btn btn-burn"
                >
                  <Flame size={16} /> Release to Campfire
                </button>
              </div>
            </motion.div>
          )}

          {actionState === 'burning' && (
            <motion.div
              key="burning-anim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative text-center py-12 overflow-hidden flex flex-col items-center justify-center"
            >
              {/* Floating Orange Ember Particles */}
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 80, x: (i - 7) * 20, opacity: 1, scale: 1 }}
                  animate={{ y: -120, x: (i - 7) * 35 + Math.sin(i) * 30, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 1.6, delay: i * 0.08 }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#f97316]"
                />
              ))}

              <Flame size={54} className="text-orange-500 animate-pulse mx-auto mb-3" />
              <p className="text-orange-200 font-serif text-lg font-bold">Dissolving into glowing embers...</p>
              <p className="text-xs text-amber-300/70 italic mt-1">The fire warms the forest night.</p>
            </motion.div>
          )}

          {actionState === 'blowing' && (
            <motion.div
              key="blowing-anim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative text-center py-12 overflow-hidden flex flex-col items-center justify-center"
            >
              {/* Floating Breeze Particles */}
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -140, y: (i - 7) * 15, opacity: 1, scale: 1 }}
                  animate={{ x: 220, y: (i - 7) * 25 + Math.cos(i) * 20, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 1.6, delay: i * 0.08 }}
                  className="absolute w-3 h-1.5 rounded-full bg-sky-300/80 shadow-[0_0_10px_#38bdf8]"
                />
              ))}

              <Wind size={54} className="text-sky-300 animate-pulse mx-auto mb-3" />
              <p className="text-sky-200 font-serif text-lg font-bold">Floating away on forest breezes...</p>
              <p className="text-xs text-sky-300/70 italic mt-1">The wind carries your secret into the trees.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
