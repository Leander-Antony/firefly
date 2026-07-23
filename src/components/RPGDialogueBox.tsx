import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Coffee, Heart, Feather, ArrowRight } from 'lucide-react';
import type { SpeakerAvatarType, StoryWaypoint } from '../types/game';
import { SoundEngine } from '../audio/SoundEngine';

interface RPGDialogueBoxProps {
  waypoint: StoryWaypoint;
  onContinue: () => void;
}

export const RPGDialogueBox: React.FC<RPGDialogueBoxProps> = ({ waypoint, onContinue }) => {
  const fullText = waypoint.dialogText;
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, charIndex + 1));
        charIndex += 1;

        if (charIndex % 3 === 0) {
          SoundEngine.playFootstep();
        }
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [fullText]);

  const handleBoxClick = () => {
    if (!isTypingComplete) {
      // Instant skip typewriter
      setDisplayedText(fullText);
      setIsTypingComplete(true);
      SoundEngine.playPageFlip();
    } else {
      // Advance dialogue
      SoundEngine.playPageFlip();
      onContinue();
    }
  };

  const renderAvatarIcon = (type: SpeakerAvatarType) => {
    switch (type) {
      case 'evelyn':
        return <BookOpen size={28} className="text-amber-300" />;
      case 'tree':
        return <Sparkles size={28} className="text-purple-300 animate-pulse" />;
      case 'kiosk':
        return <Coffee size={28} className="text-amber-400" />;
      case 'cat':
        return <Heart size={28} className="text-rose-400" />;
      default:
        return <Feather size={28} className="text-sky-300" />;
    }
  };

  return (
    <div className="rpg-dialogue-overlay pointer-events-auto" onClick={handleBoxClick}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="rpg-dialogue-card"
      >
        {/* Avatar Badge & Name Tag */}
        <div className="rpg-speaker-row">
          <div className="rpg-avatar-badge">
            {renderAvatarIcon(waypoint.speakerAvatar)}
          </div>
          <div className="rpg-speaker-info">
            <span className="rpg-speaker-name">{waypoint.speakerName}</span>
            <span className="rpg-chapter-tag">Chapter {waypoint.chapterNumber} • {waypoint.locationName}</span>
          </div>
        </div>

        {/* Typewriter Dialogue Text Bubble */}
        <div className="rpg-text-bubble">
          <p className="rpg-dialogue-text">
            {displayedText}
            {!isTypingComplete && <span className="rpg-cursor">|</span>}
          </p>
        </div>

        {/* Action Prompt */}
        <div className="rpg-action-footer">
          {isTypingComplete ? (
            <div className="rpg-next-prompt animate-bounce">
              <span>Next Chapter</span> <ArrowRight size={16} />
            </div>
          ) : (
            <div className="rpg-skip-prompt">
              <span>Click to skip text...</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
