import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Waves, Play } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';

interface StoneSkippingModalProps {
  onClose: () => void;
}

export const StoneSkippingModal: React.FC<StoneSkippingModalProps> = ({ onClose }) => {
  const [power, setPower] = useState(50);
  const [skips, setSkips] = useState<number | null>(null);
  const [isThrowing, setIsThrowing] = useState(false);

  const handleThrow = () => {
    setIsThrowing(true);
    SoundEngine.playStoneSkip();

    const calculatedSkips = Math.max(1, Math.min(7, Math.floor((power / 100) * 6 + Math.random() * 2)));

    let currentSkip = 0;
    const interval = setInterval(() => {
      currentSkip++;
      SoundEngine.playStoneSkip();
      if (currentSkip >= calculatedSkips) {
        clearInterval(interval);
        setSkips(calculatedSkips);
        setIsThrowing(false);
      }
    }, 300);
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="stone-modal-card"
      >
        <button onClick={onClose} className="close-btn absolute top-4 right-4">
          <X size={20} />
        </button>

        <div className="text-center mb-4">
          <Waves size={36} className="text-sky-300 mx-auto mb-2" />
          <h2 className="text-xl font-serif text-sky-100">Firefly Lake - Skip Stones</h2>
          <p className="text-xs text-sky-300/80">Adjust throw power and watch the stone ripple across starlight water.</p>
        </div>

        <div className="my-6">
          <label className="block text-xs font-semibold text-sky-200 mb-2">
            Throw Power: {power}%
          </label>
          <input
            type="range"
            min="20"
            max="100"
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-full accent-sky-400"
            disabled={isThrowing}
          />
        </div>

        {skips !== null && (
          <div className="text-center py-2 text-sky-200 font-serif text-lg animate-fade-in">
            ✨ Stone skipped {skips} times!
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleThrow}
            disabled={isThrowing}
            className="ui-btn-primary flex items-center gap-2"
          >
            <Play size={16} /> Throw Stone
          </button>
        </div>
      </motion.div>
    </div>
  );
};
