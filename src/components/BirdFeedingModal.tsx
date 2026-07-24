import React, { useState, useEffect, useRef } from 'react';
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
  svgKey: 'meadowRobin' | 'starlightBluebird' | 'forestFinch';
  baseX: number;  // % within grass field
  baseY: number;
  targetX: number;
  targetY: number;
  isFeeding: boolean;
  flapPhase: number;
}

interface SeedParticle {
  id: number;
  x: number;
  y: number;
}

const INITIAL_BIRDS: Bird[] = [
  {
    id: 'bird_1',
    name: 'Meadow Robin',
    svgKey: 'meadowRobin',
    baseX: 18,
    baseY: 68,
    targetX: 18,
    targetY: 68,
    isFeeding: false,
    flapPhase: 0,
  },
  {
    id: 'bird_2',
    name: 'Starlight Bluebird',
    svgKey: 'starlightBluebird',
    baseX: 50,
    baseY: 72,
    targetX: 50,
    targetY: 72,
    isFeeding: false,
    flapPhase: 1.2,
  },
  {
    id: 'bird_3',
    name: 'Forest Finch',
    svgKey: 'forestFinch',
    baseX: 80,
    baseY: 65,
    targetX: 80,
    targetY: 65,
    isFeeding: false,
    flapPhase: 2.4,
  },
];

export const BirdFeedingModal: React.FC<BirdFeedingModalProps> = ({ onClose }) => {
  const [seedsCount, setSeedsCount] = useState(0);
  const [birds, setBirds] = useState<Bird[]>(INITIAL_BIRDS);
  const [seeds, setSeeds] = useState<SeedParticle[]>([]);
  const [hasReceivedFeather, setHasReceivedFeather] = useState(false);
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(Date.now());
  const seedIdRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      setTick(Date.now() - startRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleScatterSeeds = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    SoundEngine.playFireflyCollect();

    const newSeedId = seedIdRef.current++;
    setSeeds((prev) => [
      ...prev.slice(-24), // cap at 25 seed clusters
      { id: newSeedId, x: clickX, y: Math.max(40, Math.min(88, clickY)) },
    ]);
    setSeedsCount((prev) => prev + 1);

    // Each bird flies towards click area (with spread)
    setBirds((prev) =>
      prev.map((bird, idx) => ({
        ...bird,
        targetX: Math.max(8, Math.min(92, clickX + (idx - 1) * 18)),
        targetY: Math.max(48, Math.min(85, clickY + (idx - 1) * 4 + (idx === 1 ? 0 : 4))),
        isFeeding: true,
      }))
    );

    if (seedsCount >= 2 && !hasReceivedFeather) {
      setTimeout(() => setHasReceivedFeather(true), 600);
    }
  };

  // Idle wander when not feeding
  useEffect(() => {
    if (seedsCount > 0) return;
    const interval = setInterval(() => {
      setBirds((prev) =>
        prev.map((b, idx) => ({
          ...b,
          targetX: b.baseX + Math.sin(Date.now() * 0.001 + idx * 2) * 6,
          targetY: b.baseY + Math.cos(Date.now() * 0.0008 + idx) * 3,
        }))
      );
    }, 1800);
    return () => clearInterval(interval);
  }, [seedsCount]);

  return (
    <div className="modal-backdrop z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-emerald-950/97 border border-emerald-500/25 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-center text-slate-100 overflow-hidden"
      >
        {/* Ambient light from below */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition-colors z-30"
          title="Close Bird View"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1 text-emerald-300 font-serif relative z-10">
          <Feather size={22} className="text-amber-300 animate-bounce" />
          <h2 className="text-xl font-bold tracking-wide">Flower Meadow Birds</h2>
        </div>
        <p className="text-xs text-emerald-200/70 italic font-serif mb-4 relative z-10">
          Click anywhere on the grass to scatter seeds for the meadow birds.
        </p>

        {/* ── Interactive Meadow Field ── */}
        <div
          onClick={handleScatterSeeds}
          className="relative w-full rounded-2xl border border-emerald-500/20 overflow-hidden cursor-pointer select-none"
          style={{ height: '260px' }}
        >
          {/* Sky gradient (top half) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, #0d1f12 0%, #0a2e1a 35%, #134226 55%, #166534 75%, #15803d 100%)',
            }}
          />

          {/* Distant hills */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: '65%' }}
          >
            <svg viewBox="0 0 500 170" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0,90 C60,50 130,70 200,60 C270,50 340,80 420,55 C460,42 480,50 500,45 L500,170 L0,170 Z"
                fill="#14532d"
                opacity="0.8"
              />
              <path
                d="M0,110 C40,90 100,105 160,95 C220,85 290,100 360,90 C410,83 460,95 500,88 L500,170 L0,170 Z"
                fill="#15803d"
                opacity="0.9"
              />
              <path
                d="M0,135 C50,125 110,140 180,130 C250,120 320,138 400,128 C440,123 470,132 500,126 L500,170 L0,170 Z"
                fill="#166534"
              />
              {/* Grass tufts */}
              {Array.from({ length: 18 }, (_, i) => {
                const gx = (i * 29) % 490 + 5;
                const gy = 128 + (i % 3) * 6;
                return (
                  <g key={i} transform={`translate(${gx}, ${gy})`}>
                    <line x1="0" y1="0" x2="-4" y2="-14" stroke="#4ade80" strokeWidth="1.5" opacity="0.6" />
                    <line x1="0" y1="0" x2="0"  y2="-16" stroke="#22c55e" strokeWidth="1.5" opacity="0.5" />
                    <line x1="0" y1="0" x2="4"  y2="-13" stroke="#4ade80" strokeWidth="1.5" opacity="0.6" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Ambient flowers */}
          {Array.from({ length: 14 }, (_, i) => {
            const fx = ((i * 67 + 11) % 88) + 6;
            const fy = 55 + ((i * 31) % 35);
            const hue = i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#f472b6' : '#fde047';
            return (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${fx}%`,
                  top: `${fy}%`,
                  width: '7px',
                  height: '7px',
                  backgroundColor: hue,
                  opacity: 0.55 + 0.2 * Math.sin(tick * 0.002 + i),
                  boxShadow: `0 0 6px ${hue}`,
                  transform: 'translate(-50%,-50%)',
                }}
              />
            );
          })}

          {/* Scattered Seeds */}
          {seeds.map((seed) => (
            <motion.div
              key={seed.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute pointer-events-none"
              style={{ left: `${seed.x}%`, top: `${seed.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {Array.from({ length: 5 }, (_, si) => (
                <div
                  key={si}
                  className="absolute rounded-full bg-amber-200"
                  style={{
                    width: '4px',
                    height: '4px',
                    left: `${(si % 3) * 6 - 6}px`,
                    top: `${Math.floor(si / 3) * 6 - 3}px`,
                    opacity: 0.85,
                  }}
                />
              ))}
            </motion.div>
          ))}

          {/* Animated Birds */}
          {birds.map((bird) => {
            const birdSvg = SVG_ASSETS[bird.svgKey];
            const hop = bird.isFeeding
              ? Math.abs(Math.sin(tick * 0.005 + bird.flapPhase)) * 4
              : Math.sin(tick * 0.0012 + bird.flapPhase) * 2;
            return (
              <motion.div
                key={bird.id}
                animate={{
                  left: `${bird.targetX}%`,
                  top: `${bird.targetY}%`,
                }}
                transition={{ type: 'spring', stiffness: 80, damping: 16, mass: 1.2 }}
                className="absolute flex flex-col items-center pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center drop-shadow-lg"
                  style={{ transform: `translateY(${-hop}px) scaleX(-1)` }}
                >
                  <img src={birdSvg} alt={bird.name} className="w-full h-full object-contain" />
                </div>
                <span
                  className="text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded-full border"
                  style={{
                    color: '#d1fae5',
                    backgroundColor: 'rgba(6,78,59,0.75)',
                    borderColor: 'rgba(52,211,153,0.25)',
                  }}
                >
                  {bird.name}
                </span>
              </motion.div>
            );
          })}

          {/* Click prompt */}
          {seedsCount === 0 && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 text-xs font-serif text-amber-200/75 pointer-events-none">
              ✨ Click anywhere to scatter seeds
            </div>
          )}
        </div>

        {/* Seed count */}
        {seedsCount > 0 && (
          <p className="text-xs text-emerald-400/70 font-mono mt-2 relative z-10">
            {seedsCount} handful{seedsCount !== 1 ? 's' : ''} of seeds scattered
          </p>
        )}

        {/* Reward Notification */}
        <AnimatePresence>
          {hasReceivedFeather && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl border text-xs font-serif flex items-center justify-center gap-2 relative z-10"
              style={{
                backgroundColor: 'rgba(251,191,36,0.12)',
                borderColor: 'rgba(251,191,36,0.35)',
                color: '#fde68a',
              }}
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
