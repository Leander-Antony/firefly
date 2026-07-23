import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import type { StoryWaypoint } from '../types/game';
import { SoundEngine } from '../audio/SoundEngine';

interface StoryDialogModalProps {
  waypoint: StoryWaypoint;
  onContinue: () => void;
}

export const StoryDialogModal: React.FC<StoryDialogModalProps> = ({ waypoint, onContinue }) => {
  const handleContinue = () => {
    SoundEngine.playPageFlip();
    onContinue();
  };

  return (
    <div className="modal-backdrop z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="story-dialog-card max-w-xl w-full p-6 bg-slate-900/95 border border-purple-400/40 rounded-3xl shadow-2xl relative"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Story Chapter {waypoint.chapterNumber}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <MapPin size={14} className="text-purple-400" />
            <span>{waypoint.locationName}</span>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-serif text-amber-200 mb-1">
          {waypoint.title}
        </h2>
        <p className="text-xs text-purple-300/80 italic mb-4">
          {waypoint.subtitle}
        </p>

        <div className="story-dialog-body bg-black/40 border border-white/10 rounded-2xl p-4 text-sm md:text-base font-serif text-slate-200 leading-relaxed mb-6 whitespace-pre-line">
          "{waypoint.dialogText}"
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="ui-btn-primary flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-105 transition-transform"
          >
            <span>Continue Journey</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
