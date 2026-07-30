import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gamepad2 } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';

interface ArcadeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({ engine, onClose }) => {
  const [tokenInserted, setTokenInserted] = useState(false);

  const hasToken = engine.savedState.foundEasterEggIds.includes('egg_6');

  const handleClose = () => {
    SoundEngine.playPageFlip();
    onClose();
  };

  const handleInsertToken = () => {
    if (hasToken) {
      SoundEngine.playCassetteClick();
      setTokenInserted(true);
      
      // In a more complex version this might unlock a minigame, 
      // but for now it's just a sweet little interaction.
      setTimeout(() => {
        setTokenInserted(false);
      }, 5000);
    }
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="letter-modal-card"
        style={{ perspective: 1000, maxWidth: '450px', background: 'rgba(10, 5, 25, 0.95)' }}
      >
        <div className="letter-modal-inner" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div className="letter-ambient-light" style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)' }} />
          
          <button
            onClick={handleClose}
            className="close-btn"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}
            title="Leave Arcade"
          >
            <X size={18} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(167, 139, 250, 0.3)',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
            }}>
              <Gamepad2 size={40} color="#c084fc" />
            </div>

            <h2 className="letter-title" style={{ 
              fontSize: '1.8rem', margin: '0 0 0.5rem 0',
              background: 'linear-gradient(to right, #e9d5ff, #c084fc, #e9d5ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Retro Arcade Shrine</h2>
            
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
              An abandoned arcade cabinet with a flickering CRT screen. The glass is cold, but the machine still hums faintly.
            </p>
            
            {tokenInserted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(0,0,0,0.6)', borderRadius: '16px', padding: '1.5rem', width: '100%',
                  border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem',
                  boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.1)'
                }}
              >
                <div style={{ fontSize: '1rem', color: '#6ee7b7', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                  &gt; INSERT COIN
                </div>
                <div style={{ fontSize: '0.9rem', color: '#ecfdf5', fontFamily: 'monospace' }}>
                  Thank you for playing...
                </div>
              </motion.div>
            ) : (
              <div style={{
                background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '1.5rem', width: '100%',
                border: '1px solid rgba(167, 139, 250, 0.15)', marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Arcade Token</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: hasToken ? '#fef08a' : '#475569' }}>
                  {hasToken ? '1 Token Found' : 'No Token'}
                </div>
              </div>
            )}

            {!tokenInserted && (
              <button
                onClick={handleInsertToken}
                disabled={!hasToken}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                  cursor: hasToken ? 'pointer' : 'not-allowed',
                  background: hasToken ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))' : 'rgba(255,255,255,0.05)',
                  border: hasToken ? '1px solid rgba(192,132,252,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: hasToken ? '#e9d5ff' : '#64748b',
                  transition: 'all 0.2s',
                  boxShadow: hasToken ? '0 4px 15px rgba(139,92,246,0.2)' : 'none'
                }}
              >
                {hasToken ? 'Insert Token' : 'Find a Token to Play'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
