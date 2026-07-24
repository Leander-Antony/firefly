import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Feather, Sparkles } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';
import { SVG_ASSETS } from '../utils/AssetManager';

interface BirdFeedingModalProps {
  onClose: () => void;
}

interface Bird {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  isFeeding: boolean;
}

export const BirdFeedingModal: React.FC<BirdFeedingModalProps> = ({ onClose }) => {
  const [seedsCount, setSeedsCount] = useState(0);
  const [birds, setBirds] = useState<Bird[]>([
    { id: 'bird_1', name: 'Meadow Robin', color: '#f97316', x: 25, y: 65, isFeeding: false },
    { id: 'bird_2', name: 'Starlight Bluebird', color: '#38bdf8', x: 50, y: 70, isFeeding: false },
    { id: 'bird_3', name: 'Forest Finch', color: '#fde047', x: 75, y: 62, isFeeding: false },
  ]);
  const [hasReceivedFeather, setHasReceivedFeather] = useState(false);

  const handleScatterSeeds = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    SoundEngine.playFireflyCollect();
    setSeedsCount((prev) => prev + 1);

    // Birds fly towards seeds
    setBirds((prevBirds) =>
      prevBirds.map((bird, idx) => ({
        ...bird,
        x: Math.max(15, Math.min(85, clickX + (idx - 1) * 15)),
        y: Math.max(45, Math.min(80, clickY + (idx - 1) * 5)),
        isFeeding: true,
      }))
    );

    if (seedsCount >= 2 && !hasReceivedFeather) {
      setHasReceivedFeather(true);
    }
  };

  return (
    <div className="modal-backdrop z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-emerald-950/95 border border-emerald-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-center text-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition-colors z-30"
          title="Close Bird View"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-300 font-serif">
          <Feather size={22} className="text-amber-300 animate-bounce" />
          <h2 className="text-xl font-bold tracking-wide">Flower Meadow Birds</h2>
        </div>
        <p className="text-xs text-emerald-200/80 italic font-serif mb-4">
          Click anywhere on the grass below to scatter seeds for the meadow birds.
        </p>

        {/* Interactive Grass Field Area */}
        <div
          onClick={handleScatterSeeds}
          className="relative w-full h-64 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-900/40 to-emerald-950/80 shadow-inner overflow-hidden cursor-pointer group"
        >
          {/* Ambient Lavender Flowers */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-purple-400/60 animate-pulse"
              style={{
                top: `${(i * 19) % 70 + 20}%`,
                left: `${(i * 29) % 85 + 8}%`,
              }}
            />
          ))}

          {/* Scattered Seeds */}
          {Array.from({ length: Math.min(seedsCount * 4, 20) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-200 shadow-sm"
              style={{
                top: `${(i * 23 + 40) % 40 + 45}%`,
                left: `${(i * 37 + 20) % 80 + 10}%`,
              }}
            />
          ))}

          {/* Animated Birds */}
          {birds.map((bird) => {
            const birdSvg =
              bird.id === 'bird_1'
                ? SVG_ASSETS.meadowRobin
                : bird.id === 'bird_2'
                ? SVG_ASSETS.starlightBluebird
                : SVG_ASSETS.forestFinch;
            return (
              <motion.div
                key={bird.id}
                animate={{ x: `${bird.x}%`, y: `${bird.y}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              >
                {/* SVG Bird Sprite */}
                <div className="w-12 h-12 flex items-center justify-center animate-bounce drop-shadow-lg">
                  <img src={birdSvg} alt={bird.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-mono text-emerald-200/80 mt-0.5 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  {bird.name}
                </span>
              </motion.div>
            );
          })}

          {/* Click prompt overlay */}
          {seedsCount === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-amber-200/80 bg-black/20 pointer-events-none">
              ✨ Click to scatter bird seeds
            </div>
          )}
        </div>

        {/* Reward Keepsake Notification */}
        <AnimatePresence>
          {hasReceivedFeather && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-serif flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-amber-300 animate-spin" />
              <span>The meadow birds left a soft white feather on the grass.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
