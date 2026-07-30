import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import type { LetterEntity } from '../types/game';
import { SoundEngine } from '../audio/SoundEngine';
import { SVG_ASSETS } from '../utils/AssetManager';

interface LetterModalProps {
  letter: LetterEntity;
  onClose: () => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({ letter, onClose }) => {
  const handleClose = () => {
    SoundEngine.playPageFlip();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="letter-modal-card"
        style={{ perspective: 1000 }}
      >
        {/* Swinging Lantern Animation */}
        <motion.div
          animate={{ 
            rotate: [-6, 6, -6]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="letter-lantern-container"
        >
          {/* Intense magical glow effect behind lantern */}
          <motion.div 
            animate={{
              scale: [0.9, 1.3, 0.9],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="letter-lantern-glow"
          />
          <img 
            src={SVG_ASSETS.fireflyLantern} 
            alt="Firefly Lantern" 
            className="letter-lantern-img"
          />
        </motion.div>

        {/* Premium Modal Card Inner */}
        <div className="letter-modal-inner">
          <div className="letter-ambient-light" />
          
          {/* Header */}
          <div className="letter-modal-header">
            <div className="letter-location">
              <MapPin size={14} color="#f59e0b" />
              <span>{letter.locationName}</span>
            </div>
            <button
              onClick={handleClose}
              className="close-btn"
              title="Close Letter"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Area */}
          <div className="letter-content-area">
            <h2 className="letter-title">
              {letter.title}
            </h2>

            <div style={{ position: 'relative' }}>
              {/* Decorative Elements */}
              <div className="letter-quote-mark left">"</div>
              <div className="letter-quote-mark right">"</div>
              
              <div className="letter-text-box">
                {letter.content}
              </div>
            </div>
            
            {/* Ornate Footer */}
            <div className="letter-ornate-footer">
              <div className="letter-line"></div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="letter-diamond"></div>
                <div style={{ position: 'absolute', width: '20px', height: '20px', border: '1px solid rgba(251, 146, 60, 0.4)', transform: 'rotate(45deg)' }}></div>
              </div>
              <div className="letter-line reverse"></div>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};
