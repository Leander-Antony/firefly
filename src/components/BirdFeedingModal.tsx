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
    <div className="modal-backdrop" style={{ 
      zIndex: 50, 
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Close Button - Floating Top Right */}
      <button
        onClick={onClose}
        className="ui-btn-icon"
        style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 60 }}
        title="Close View"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="letter-modal-card"
        style={{ 
          perspective: 1000, 
          maxWidth: '600px', 
          width: '100%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          background: 'rgba(6, 20, 12, 0.95)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(16, 185, 129, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="letter-ambient-light" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.4), transparent 70%)' }}></div>
        
        <div className="letter-modal-inner" style={{ 
          width: '100%', 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '1rem',
                backgroundColor: 'rgba(2, 44, 34, 0.8)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                backdropFilter: 'blur(24px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 30px rgba(16,185,129,0.3)' 
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(to bottom, rgba(52, 211, 153, 0.2), transparent)' }}></div>
              <Feather size={32} color="#6ee7b7" style={{ filter: 'drop-shadow(0 0 10px rgba(110,231,183,0.8))' }} />
            </div>
            
            <h2 
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                fontSize: '1.875rem',
                lineHeight: '2.25rem',
                margin: 0,
                background: 'linear-gradient(to bottom, #fff, #a7f3d0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(16, 185, 129, 0.5)'
              }}
            >
              Flower Meadow Birds
            </h2>
            
            <p style={{ 
              fontSize: '0.875rem',
              marginTop: '0.75rem', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              fontWeight: 600,
              margin: '0.75rem 0 0 0',
              color: 'rgba(167, 243, 208, 0.6)' 
            }}>
              Scatter seeds for the weary travelers
            </p>
          </div>

          {/* ── Interactive Meadow Field ── */}
          <div
            onClick={handleScatterSeeds}
            style={{ 
              position: 'relative',
              width: '100%', 
              borderRadius: '1rem',
              overflow: 'hidden',
              cursor: 'pointer',
              userSelect: 'none',
              height: '280px', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              boxShadow: '0 0 40px rgba(16,185,129,0.15), inset 0 0 50px rgba(0,0,0,0.5)' 
            }}
          >
            {/* Sky gradient (top half) */}
            <div
              style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                background: 'linear-gradient(to bottom, #0d1f12 0%, #0a2e1a 35%, #134226 55%, #166534 75%, #15803d 100%)',
              }}
            />

            {/* Distant hills */}
            <div
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none', height: '65%' }}
            >
              <svg viewBox="0 0 500 170" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
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
                {Array.from({ length: 24 }, (_, i) => {
                  const gx = (i * 21) % 490 + 5;
                  const gy = 120 + (i % 4) * 10;
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
            {Array.from({ length: 20 }, (_, i) => {
              const fx = ((i * 67 + 11) % 88) + 6;
              const fy = 55 + ((i * 31) % 35);
              const hue = i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#f472b6' : '#fde047';
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    left: `${fx}%`,
                    top: `${fy}%`,
                    width: '6px',
                    height: '6px',
                    backgroundColor: hue,
                    opacity: 0.55 + 0.2 * Math.sin(tick * 0.002 + i),
                    boxShadow: `0 0 8px ${hue}`,
                    transform: 'translate(-50%,-50%)',
                  }}
                />
              );
            })}

            {/* Scattered Seeds */}
            {seeds.map((seed) => (
              <motion.div
                key={seed.id}
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                style={{ 
                  position: 'absolute', 
                  pointerEvents: 'none', 
                  left: `${seed.x}%`, 
                  top: `${seed.y}%`, 
                  transform: 'translate(-50%,-50%)' 
                }}
              >
                {Array.from({ length: 5 }, (_, si) => (
                  <div
                    key={si}
                    style={{
                      position: 'absolute',
                      borderRadius: '50%',
                      backgroundColor: '#fde68a',
                      width: '4px',
                      height: '4px',
                      left: `${(si % 3) * 6 - 6}px`,
                      top: `${Math.floor(si / 3) * 6 - 3}px`,
                      opacity: 0.9,
                      boxShadow: '0 0 4px rgba(253,230,138,0.8)'
                    }}
                  />
                ))}
              </motion.div>
            ))}

            {/* Animated Birds */}
            {birds.map((bird) => {
              const birdSvg = SVG_ASSETS[bird.svgKey];
              const isPecking = bird.isFeeding && Math.sin(tick * 0.015 + bird.flapPhase * 10) > 0;
              const hop = bird.isFeeding
                ? (isPecking ? -5 : Math.abs(Math.sin(tick * 0.005 + bird.flapPhase)) * 6)
                : Math.sin(tick * 0.0012 + bird.flapPhase) * 3;
              const rotation = isPecking ? -30 : 0;
              
              return (
                <motion.div
                  key={bird.id}
                  animate={{
                    left: `${bird.targetX}%`,
                    top: `${bird.targetY}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12, mass: 1.5 }}
                  style={{ 
                    position: 'absolute', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <div
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.4))',
                      transform: `translateY(${-hop}px) scaleX(-1) rotate(${rotation}deg)`,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.1s ease-in-out'
                    }}
                  >
                    <img src={birdSvg} alt={bird.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </motion.div>
              );
            })}

            {/* Click prompt */}
            {seedsCount === 0 && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, right: 0, bottom: 0, left: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  pointerEvents: 'none', 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  backdropFilter: 'blur(2px)' 
                }}
              >
                <Sparkles size={28} color="#fcd34d" style={{ marginBottom: '0.75rem' }} />
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  letterSpacing: '0.05em', 
                  textTransform: 'uppercase', 
                  color: '#a7f3d0', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                }}>
                  Click to scatter seeds
                </span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <div style={{ 
              fontSize: '0.875rem', 
              fontFamily: 'monospace', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'rgba(52, 211, 153, 0.8)' 
            }}>
              <span style={{ borderRadius: '50%', backgroundColor: '#10b981', width: '8px', height: '8px' }}></span>
              {seedsCount} {seedsCount === 1 ? 'Handful' : 'Handfuls'}
            </div>
            
            <AnimatePresence>
              {hasReceivedFeather && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '9999px',
                    color: '#fcd34d',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    boxShadow: '0 0 15px rgba(251, 191, 36, 0.2)'
                  }}
                >
                  <Feather size={14} />
                  Feather Found
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
