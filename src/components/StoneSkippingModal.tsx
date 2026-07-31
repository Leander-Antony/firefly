import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Waves, Play } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';

interface StoneSkippingModalProps {
  onClose: () => void;
}

export const StoneSkippingModal: React.FC<StoneSkippingModalProps> = ({ onClose }) => {
  const [power, setPower] = useState(50);
  const [targetSkips, setTargetSkips] = useState<number | null>(null);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [isThrowing, setIsThrowing] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: string; y: number }[]>([]);

  const handleThrow = () => {
    setIsThrowing(true);
    setCurrentSkip(0);
    setRipples([]);
    setTargetSkips(null);
    SoundEngine.playStoneSkip();

    const calculatedSkips = Math.max(1, Math.min(8, Math.floor((power / 100) * 7 + Math.random() * 2)));
    setTargetSkips(calculatedSkips);

    let skipCount = 0;
    const interval = setInterval(() => {
      skipCount++;
      setCurrentSkip(skipCount);
      SoundEngine.playStoneSkip();
      
      // Add ripple
      setRipples(prev => [...prev, { id: Date.now(), x: `${(skipCount / calculatedSkips) * 80 + 10}%`, y: 0 }]);

      if (skipCount >= calculatedSkips) {
        clearInterval(interval);
        setTimeout(() => {
          setIsThrowing(false);
        }, 1000); // keep final state for a second
      }
    }, 400); // 400ms per skip
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="letter-modal-card"
        style={{ perspective: 1000, maxWidth: '550px', background: 'rgba(10, 5, 25, 0.95)' }}
      >
        <div className="letter-modal-inner" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="letter-ambient-light" style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)' }} />
          
          <button
            onClick={onClose}
            className="close-btn"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}
            title="Leave Lake"
          >
            <X size={18} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(56, 189, 248, 0.3)',
              marginBottom: '0.5rem',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)'
            }}>
              <Waves size={30} color="#38bdf8" />
            </div>

            <h2 className="letter-title" style={{ 
              fontSize: '1.8rem', margin: '0 0 0.5rem 0',
              background: 'linear-gradient(to right, #bae6fd, #38bdf8, #bae6fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Firefly Lake</h2>
            
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
              Adjust throw power and watch the stone ripple across the starlit water.
            </p>

            {/* Animation Canvas */}
            <div style={{
              width: '100%', height: '140px', borderRadius: '16px',
              background: 'linear-gradient(180deg, #0f172a 0%, #082f49 100%)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              position: 'relative', overflow: 'hidden',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
              marginBottom: '1.5rem'
            }}>
              {/* Water surface line */}
              <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', background: 'rgba(56, 189, 248, 0.3)', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }} />

              {/* Ripples */}
              <AnimatePresence>
                {ripples.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{ width: 60, height: 20, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                      position: 'absolute',
                      left: r.x,
                      top: '75%',
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid rgba(56, 189, 248, 0.6)',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* The Stone */}
              {targetSkips !== null && (
                <motion.div
                  animate={{
                    left: `${(currentSkip / targetSkips) * 80 + 10}%`,
                  }}
                  transition={{
                    left: { duration: 0.4, ease: "linear" }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0, left: '10%',
                    width: '100%', height: '100%',
                    zIndex: 10
                  }}
                >
                  <motion.div
                    key={currentSkip}
                    initial={{ top: '75%' }}
                    animate={{
                      top: isThrowing && currentSkip < targetSkips ? ['75%', '30%', '75%'] : '75%',
                    }}
                    transition={{
                      top: { duration: 0.4, ease: "easeInOut" }
                    }}
                    style={{
                      position: 'absolute',
                      width: '16px', height: '8px',
                      background: '#94a3b8',
                      borderRadius: '50%',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </motion.div>
              )}
            </div>

            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#7dd3fc', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Throw Power: {power}%
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: isThrowing ? 'not-allowed' : 'pointer' }}
                disabled={isThrowing}
              />
            </div>

            {targetSkips !== null && !isThrowing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(2, 132, 199, 0.1)', borderRadius: '12px', padding: '1rem', width: '100%',
                  border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '1rem'
                }}
              >
                <div style={{ fontSize: '1.2rem', color: '#bae6fd', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  ✨ {targetSkips} Skips!
                </div>
              </motion.div>
            )}

            <button
              onClick={handleThrow}
              disabled={isThrowing}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                cursor: isThrowing ? 'not-allowed' : 'pointer',
                background: isThrowing ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(14, 165, 233, 0.1))',
                border: isThrowing ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(56, 189, 248, 0.5)',
                color: isThrowing ? '#64748b' : '#bae6fd',
                transition: 'all 0.2s',
                boxShadow: isThrowing ? 'none' : '0 4px 15px rgba(14, 165, 233, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Play size={18} /> {isThrowing ? 'Throwing...' : 'Throw Stone'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
