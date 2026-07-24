import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Eye } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';
import { SVG_ASSETS } from '../utils/AssetManager';

interface TelescopeModalProps {
  onClose: () => void;
}

interface Constellation {
  id: string;
  name: string;
  description: string;
  stars: Array<{ x: number; y: number }>;
}

const CONSTELLATIONS: Constellation[] = [
  {
    id: 'lantern_cluster',
    name: 'The Firefly Lantern',
    description: 'A cluster of 7 bright stars forming an iron lantern. Travelers say it guides lost spirits through the night.',
    stars: [
      { x: 50, y: 30 },
      { x: 42, y: 40 },
      { x: 58, y: 40 },
      { x: 38, y: 55 },
      { x: 62, y: 55 },
      { x: 50, y: 65 },
      { x: 50, y: 22 },
    ],
  },
  {
    id: 'two_paths',
    name: 'The Parallel Trails',
    description: 'Two faint star streams that unknowingly cross the same night sky horizon.',
    stars: [
      { x: 25, y: 25 },
      { x: 35, y: 35 },
      { x: 45, y: 45 },
      { x: 75, y: 25 },
      { x: 65, y: 35 },
      { x: 55, y: 45 },
    ],
  },
  {
    id: 'coffee_cup',
    name: 'The Warm Cup',
    description: 'Four warm golden stars arranged in the shape of a ceramic mug.',
    stars: [
      { x: 70, y: 65 },
      { x: 80, y: 65 },
      { x: 82, y: 78 },
      { x: 68, y: 78 },
    ],
  },
];

export const TelescopeModal: React.FC<TelescopeModalProps> = ({ onClose }) => {
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(CONSTELLATIONS[0]);

  const handleSelect = (c: Constellation) => {
    setSelectedConstellation(c);
    SoundEngine.playFireflyCollect();
  };

  return (
    <div className="modal-backdrop z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-slate-950/95 border border-purple-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-center text-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors z-30"
          title="Close Telescope View"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4 text-purple-300 font-serif">
          <Eye size={22} className="text-amber-300 animate-pulse" />
          <h2 className="text-xl font-bold tracking-wide">Forgotten Observatory Lens</h2>
        </div>

        {/* Vintage Telescope Viewfinder (Circular Sky Viewport) */}
        <div className="relative w-full aspect-square max-w-md mx-auto rounded-full shadow-inner bg-slate-900 overflow-visible my-4 group cursor-crosshair">
          {/* Eyepiece Grid Crosshairs */}
          <div className="absolute inset-0 border border-purple-500/20 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-purple-400/20 pointer-events-none" />
          <div className="absolute left-1/2 top-0 w-px h-full bg-purple-400/20 pointer-events-none" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none z-10" />

          {/* Background Twinkling Stars */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: `${(i * 17) % 90 + 5}%`,
                left: `${(i * 23) % 90 + 5}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                opacity: 0.4 + (i % 5) * 0.12,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            />
          ))}

          {/* Active Constellation Lines */}
          {selectedConstellation && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={selectedConstellation.stars.map((s) => `${s.x}%,${s.y}%`).join(' ')}
                fill="none"
                stroke="rgba(251, 146, 60, 0.65)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {selectedConstellation.stars.map((s, idx) => (
                <circle key={idx} cx={`${s.x}%`} cy={`${s.y}%`} r="4" fill="#fef08a" className="animate-ping" />
              ))}
            </svg>
          )}

          {/* Interactive Constellation Node Buttons */}
          {CONSTELLATIONS.map((c) => {
            const isSelected = selectedConstellation?.id === c.id;
            const centerStar = c.stars[0];
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-20 ${
                  isSelected
                    ? 'bg-amber-400/40 text-amber-200 ring-4 ring-amber-300/50 scale-125'
                    : 'bg-purple-900/60 text-purple-300 hover:scale-110'
                }`}
                style={{ top: `${centerStar.y}%`, left: `${centerStar.x}%` }}
              >
                <Sparkles size={14} />
              </button>
            );
          })}
          {/* Brass Telescope Viewfinder SVG Rim Overlay */}
          <img
            src={SVG_ASSETS.telescopeViewfinder}
            alt="Telescope Viewfinder"
            className="absolute inset-0 w-full h-full pointer-events-none z-30 scale-125"
          />
        </div>

        {/* Selected Constellation Description */}
        {selectedConstellation ? (
          <motion.div
            key={selectedConstellation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-center"
          >
            <h3 className="text-base font-serif font-bold text-amber-300 flex items-center justify-center gap-2">
              <Sparkles size={16} /> {selectedConstellation.name}
            </h3>
            <p className="text-xs font-serif italic text-purple-200/90 mt-1 leading-relaxed">
              "{selectedConstellation.description}"
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-purple-300/60 italic mt-2">
            Click on glowing star clusters through the eyepiece to identify constellations.
          </p>
        )}
      </motion.div>
    </div>
  );
};
