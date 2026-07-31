import React, { useState, useEffect } from 'react';
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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (actionState !== 'idle') {
      const interval = setInterval(() => setTick(t => t + 1), 30);
      return () => clearInterval(interval);
    }
  }, [actionState]);

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
    }, 2800);
  };

  const handleThrowToWind = () => {
    if (!text.trim()) return;
    setActionState('blowing');
    SoundEngine.playFireflyCollect();
    setTimeout(() => {
      onClose();
    }, 2800);
  };

  const btnStyleBase = {
    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
    borderRadius: '9999px', transition: 'all 0.2s', textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', outline: 'none'
  };

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
      {/* Close Button */}
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
          background: 'rgba(20, 10, 25, 0.95)',
          borderColor: 'rgba(168, 85, 247, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <div className="letter-ambient-light" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.3), transparent 70%)' }}></div>
        
        <div className="letter-modal-inner" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '1rem', backgroundColor: 'rgba(59, 7, 100, 0.8)', 
              border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 0 30px rgba(168,85,247,0.3)', marginBottom: '1rem', position: 'relative', overflow: 'hidden' 
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(to bottom, rgba(192, 132, 252, 0.2), transparent)' }}></div>
              <Sparkles size={32} color="#d8b4fe" style={{ filter: 'drop-shadow(0 0 10px rgba(216,180,254,0.8))' }} />
            </div>
            
            <h2 style={{
              fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', 
              textAlign: 'center', fontSize: '1.875rem', lineHeight: '2.25rem', margin: 0,
              background: 'linear-gradient(to bottom, #fff, #d8b4fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(168, 85, 247, 0.5)'
            }}>
              The Whisper Tree
            </h2>
            
            <p style={{ 
              fontSize: '0.875rem', color: 'rgba(233, 213, 255, 0.6)', marginTop: '0.75rem', letterSpacing: '0.1em', 
              textTransform: 'uppercase', fontWeight: 600, margin: '0.75rem 0 0 0' 
            }}>
              Leave your thoughts where the forest can hear
            </p>
          </div>

          <div style={{ width: '100%', position: 'relative', minHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {actionState === 'idle' && (
                <motion.div key="input-form" exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', position: 'relative', marginBottom: '1.5rem' }}>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write a secret, a regret, or a wish..."
                      style={{ 
                        width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(168, 85, 247, 0.3)', 
                        borderRadius: '1rem', padding: '1.5rem', color: '#f3e8ff', outline: 'none', resize: 'none', 
                        position: 'relative', zIndex: 10, fontFamily: 'serif', fontSize: '1.125rem', lineHeight: 1.625, 
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)', boxSizing: 'border-box'
                      }}
                      rows={5}
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleKeep}
                      disabled={!text.trim()}
                      style={{ 
                        ...btnStyleBase, 
                        backgroundColor: 'rgba(88, 28, 135, 0.4)', color: '#e9d5ff', border: '1px solid rgba(168, 85, 247, 0.3)',
                        opacity: !text.trim() ? 0.3 : 1
                      }}
                    >
                      <BookMarked size={16} /> Keep (Save)
                    </button>
                    <button
                      onClick={handleThrowToWind}
                      disabled={!text.trim()}
                      style={{ 
                        ...btnStyleBase, 
                        backgroundColor: 'rgba(12, 74, 110, 0.4)', color: '#bae6fd', border: '1px solid rgba(14, 165, 233, 0.3)',
                        opacity: !text.trim() ? 0.3 : 1
                      }}
                    >
                      <Wind size={16} /> Whisper to Wind
                    </button>
                    <button
                      onClick={handleBurn}
                      disabled={!text.trim()}
                      style={{ 
                        ...btnStyleBase, 
                        backgroundColor: 'rgba(124, 45, 18, 0.4)', color: '#fed7aa', border: '1px solid rgba(249, 115, 22, 0.3)',
                        opacity: !text.trim() ? 0.3 : 1
                      }}
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
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2.5rem 0' }}
                >
                  <div style={{ position: 'relative', width: '192px', height: '192px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="200" height="200" viewBox="0 0 100 100" style={{ position: 'relative', zIndex: 10, overflow: 'visible' }}>
                      {/* Campfire logs */}
                      <g transform="translate(50, 80)">
                        <rect x="-25" y="-5" width="50" height="10" rx="3" fill="#451a03" transform="rotate(15)" />
                        <rect x="-25" y="-5" width="50" height="10" rx="3" fill="#381302" transform="rotate(-15)" />
                        {/* Embers under logs */}
                        <circle cx="0" cy="5" r="4" fill="#f97316" filter="blur(2px)" opacity={0.8 + Math.sin(tick*0.2)*0.2} />
                        <circle cx="-10" cy="2" r="3" fill="#fbbf24" filter="blur(1px)" opacity={0.6 + Math.sin(tick*0.3)*0.4} />
                        <circle cx="12" cy="3" r="5" fill="#ef4444" filter="blur(2px)" opacity={0.7 + Math.cos(tick*0.25)*0.3} />
                      </g>
                      
                      {/* Paper falling and burning */}
                      <motion.g
                        initial={{ y: -60, rotation: -10, scale: 1, opacity: 1 }}
                        animate={{ y: 60, rotation: 15, scale: 0.1, opacity: 0 }}
                        transition={{ duration: 2, ease: "easeIn" }}
                      >
                        <rect x="40" y="-15" width="20" height="30" fill="#fef3c7" rx="2" />
                        <line x1="44" y1="-5" x2="56" y2="-5" stroke="#d97706" strokeWidth="1" opacity="0.5" />
                        <line x1="44" y1="0" x2="52" y2="0" stroke="#d97706" strokeWidth="1" opacity="0.5" />
                        <line x1="44" y1="5" x2="56" y2="5" stroke="#d97706" strokeWidth="1" opacity="0.5" />
                        {/* Fire consuming paper */}
                        <motion.rect 
                          x="40" y="-15" width="20" height="30" fill="#9a3412" rx="2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.8, 1] }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </motion.g>

                      {/* Main Flames */}
                      <path 
                        d={`M 50,80 Q ${40 + Math.sin(tick*0.1)*5},50 50,30 Q ${60 + Math.cos(tick*0.15)*5},60 50,80`} 
                        fill="#fb923c" 
                        opacity="0.8" 
                        style={{ filter: 'drop-shadow(0 0 10px #f97316)' }}
                      />
                      <path 
                        d={`M 50,80 Q ${35 + Math.sin(tick*0.12 + 1)*8},60 42,40 Q ${45 + Math.cos(tick*0.1 + 1)*3},70 50,80`} 
                        fill="#fef08a" 
                        opacity="0.9" 
                      />
                      <path 
                        d={`M 50,80 Q ${65 + Math.sin(tick*0.14 + 2)*8},60 58,40 Q ${55 + Math.cos(tick*0.11 + 2)*3},70 50,80`} 
                        fill="#facc15" 
                        opacity="0.9" 
                      />
                      
                      {/* Floating glowing embers */}
                      {Array.from({ length: 25 }).map((_, i) => (
                        <motion.circle
                          key={i}
                          cx="50" cy="70" r={Math.random() * 2 + 1}
                          fill={i % 2 === 0 ? "#fde047" : "#fb923c"}
                          initial={{ y: 0, x: 0, opacity: 0 }}
                          animate={{ 
                            y: -80 - Math.random() * 40, 
                            x: (Math.random() - 0.5) * 60 + Math.sin(tick*0.05 + i)*10, 
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ duration: 1.5 + Math.random(), delay: i * 0.1, ease: "easeOut" }}
                          style={{ filter: 'drop-shadow(0 0 4px #f97316)' }}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  <h3 style={{ color: '#fed7aa', fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.025em', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    Dissolving into embers...
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(251, 146, 60, 0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                    The fire warms the forest night
                  </p>
                </motion.div>
              )}

              {actionState === 'blowing' && (
                <motion.div
                  key="blowing-anim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '2.5rem 0' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '192px', marginBottom: '1.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="200" viewBox="0 0 300 100" style={{ position: 'relative', zIndex: 10, overflow: 'visible' }}>
                      {/* Wind trails */}
                      <path 
                        d={`M 0,${60 + Math.sin(tick*0.05)*10} Q 150,${20 + Math.cos(tick*0.03)*20} 300,${40 + Math.sin(tick*0.04)*15}`} 
                        fill="none" 
                        stroke="rgba(125, 211, 252, 0.2)" 
                        strokeWidth="2" 
                        strokeDasharray="20 40" 
                        strokeDashoffset={-tick} 
                      />
                      <path 
                        d={`M 0,${80 + Math.cos(tick*0.04)*15} Q 150,${90 + Math.sin(tick*0.05)*10} 300,${20 + Math.cos(tick*0.03)*20}`} 
                        fill="none" 
                        stroke="rgba(186, 230, 253, 0.15)" 
                        strokeWidth="4" 
                        strokeDasharray="40 60" 
                        strokeDashoffset={-tick * 1.5} 
                      />

                      {/* Paper turning into leaves/dandelion seeds */}
                      <motion.g
                        initial={{ x: 50, y: 50, opacity: 1, scale: 1 }}
                        animate={{ x: 100, y: 40, opacity: 0, scale: 0 }}
                        transition={{ duration: 1 }}
                      >
                        <rect x="-10" y="-15" width="20" height="30" fill="#f0f9ff" rx="2" style={{ filter: 'drop-shadow(0 0 10px rgba(186, 230, 253, 0.5))' }} />
                        <line x1="-6" y1="-5" x2="6" y2="-5" stroke="#bae6fd" strokeWidth="1" />
                        <line x1="-6" y1="0" x2="3" y2="0" stroke="#bae6fd" strokeWidth="1" />
                        <line x1="-6" y1="5" x2="6" y2="5" stroke="#bae6fd" strokeWidth="1" />
                      </motion.g>

                      {/* Leaves blowing away */}
                      {Array.from({ length: 30 }).map((_, i) => {
                        const startDelay = i * 0.05;
                        return (
                          <motion.g
                            key={i}
                            initial={{ x: 80, y: 45, opacity: 0, scale: 0 }}
                            animate={{ 
                              x: [80, 150 + i*2, 350], 
                              y: [45, 20 + Math.sin(i)*30, Math.cos(i)*40], 
                              opacity: [0, 1, 0],
                              scale: [0, Math.random() * 0.5 + 0.5, 0],
                              rotate: [0, 360]
                            }}
                            transition={{ duration: 2, delay: startDelay + 0.5, ease: "easeOut" }}
                          >
                            <path 
                              d="M 0,0 C 2,-5 8,-5 10,0 C 8,5 2,5 0,0" 
                              fill={i % 3 === 0 ? "#7dd3fc" : i % 3 === 1 ? "#38bdf8" : "#bae6fd"} 
                              style={{ filter: 'drop-shadow(0 0 4px #7dd3fc)' }}
                            />
                          </motion.g>
                        )
                      })}
                      
                      {/* Glowing light particles */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.circle
                          key={`particle-${i}`}
                          r={Math.random() * 2 + 1}
                          fill="#e0f2fe"
                          initial={{ x: 90, y: 45, opacity: 0 }}
                          animate={{ 
                            x: [90, 200 + i*5, 320], 
                            y: [45, 50 + Math.sin(i*2)*40, 20 + Math.cos(i*3)*50], 
                            opacity: [0, 0.8, 0] 
                          }}
                          transition={{ duration: 1.5, delay: i * 0.08 + 0.6, ease: "easeInOut" }}
                          style={{ filter: 'drop-shadow(0 0 5px #bae6fd)' }}
                        />
                      ))}
                    </svg>
                  </div>

                  <h3 style={{ color: '#bae6fd', fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.025em', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    Carried by the wind...
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(125, 211, 252, 0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                    Your secret scatters into the trees
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
