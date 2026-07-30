import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';

interface CoffeeStandModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const CoffeeStandModal: React.FC<CoffeeStandModalProps> = ({ engine, onClose }) => {
  const [purchased, setPurchased] = useState(false);

  const handleClose = () => {
    engine.exitPerspectiveMode();
    SoundEngine.playPageFlip();
    onClose();
  };

  const handleBuyCoffee = () => {
    if (engine.savedState.coffeeCount >= 5) {
      engine.savedState.coffeeCount -= 5;
      saveGameState(engine.savedState);
      SoundEngine.playPageFlip(); // Or another sound
      setPurchased(true);
      
      // Reset purchased state after 3 seconds
      setTimeout(() => {
        setPurchased(false);
      }, 3000);
    }
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="letter-modal-card"
        style={{ perspective: 1000, maxWidth: '450px' }}
      >
        <div className="letter-modal-inner" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div className="letter-ambient-light" />
          
          <button
            onClick={handleClose}
            className="close-btn"
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}
            title="Leave Stand"
          >
            <X size={18} />
          </button>
          
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(217, 119, 6, 0.2)'
            }}>
              <span style={{ fontSize: '2.5rem' }}>☕</span>
            </div>

            <h2 className="letter-title" style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Coffee Corner</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.5rem', fontFamily: 'Georgia, serif' }}>
              The rich aroma of roasted beans cuts through the twilight mist.
            </p>
            
            <div style={{
              background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '1.5rem', width: '100%',
              border: '1px solid rgba(251,146,60,0.15)', marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Your Coffee Beans</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b', textShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}>
                {engine.savedState.coffeeCount}
              </div>
            </div>

            {purchased ? (
              <div style={{ padding: '1rem', color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>
                You enjoyed a warm cup of coffee! ☕
              </div>
            ) : (
              <button
                onClick={handleBuyCoffee}
                disabled={engine.savedState.coffeeCount < 5}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
                  cursor: engine.savedState.coffeeCount >= 5 ? 'pointer' : 'not-allowed',
                  background: engine.savedState.coffeeCount >= 5 ? 'linear-gradient(135deg, rgba(217,119,6,0.3), rgba(217,119,6,0.1))' : 'rgba(255,255,255,0.05)',
                  border: engine.savedState.coffeeCount >= 5 ? '1px solid rgba(251,146,60,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: engine.savedState.coffeeCount >= 5 ? '#fef08a' : '#64748b',
                  transition: 'all 0.2s',
                  boxShadow: engine.savedState.coffeeCount >= 5 ? '0 4px 15px rgba(217,119,6,0.2)' : 'none'
                }}
              >
                {engine.savedState.coffeeCount >= 5 ? 'Exchange 5 Beans for Coffee' : 'Need 5 Beans to Exchange'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
