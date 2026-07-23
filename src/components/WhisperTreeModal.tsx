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
    SoundEngine.playPageFlip();
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  const handleThrowToWind = () => {
    if (!text.trim()) return;
    setActionState('blowing');
    SoundEngine.playPageFlip();
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="whisper-modal-card"
      >
        <button onClick={onClose} className="close-btn absolute top-4 right-4">
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/50 text-purple-300 mb-2">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-serif text-purple-100">The Whisper Tree</h2>
          <p className="text-sm text-purple-300/80 italic mt-1">
            "You don't have to tell anyone. You can leave it here."
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
                  <Wind size={16} /> Throw to Wind
                </button>
                <button
                  onClick={handleBurn}
                  disabled={!text.trim()}
                  className="whisper-btn btn-burn"
                >
                  <Flame size={16} /> Burn
                </button>
              </div>
            </motion.div>
          )}

          {actionState === 'burning' && (
            <motion.div
              key="burning-anim"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
              transition={{ duration: 1.2 }}
              className="text-center py-10"
            >
              <Flame size={48} className="text-orange-500 animate-bounce mx-auto mb-2" />
              <p className="text-orange-200 font-serif text-lg">Dissolving into glowing embers...</p>
            </motion.div>
          )}

          {actionState === 'blowing' && (
            <motion.div
              key="blowing-anim"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 300, y: -150, opacity: 0, rotate: 25 }}
              transition={{ duration: 1.2 }}
              className="text-center py-10"
            >
              <Wind size={48} className="text-sky-300 animate-pulse mx-auto mb-2" />
              <p className="text-sky-200 font-serif text-lg">Floating away on forest breezes...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
