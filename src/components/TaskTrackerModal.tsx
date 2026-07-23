import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Circle, Compass } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';

interface TaskTrackerModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const TaskTrackerModal: React.FC<TaskTrackerModalProps> = ({ engine, onClose }) => {
  const tasks = engine.tasks;

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="settings-modal-card custom-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass size={22} className="text-amber-300" />
            <h2 className="text-xl font-serif text-slate-100">Traveler's Tasks & Quests</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="tasks-list-modal">
          {tasks.map((t) => (
            <div
              key={t.id}
              className={`task-card-item ${t.completed ? 'completed' : 'in-progress'}`}
            >
              <div className="task-icon">
                {t.completed ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <Circle size={22} className="text-amber-300/60" />
                )}
              </div>
              <div className="task-details">
                <h4 className="task-title-text">{t.title}</h4>
                <p className="task-desc-text">{t.description}</p>
                <div className="task-progress-bar-bg">
                  <div
                    className="task-progress-bar-fill"
                    style={{ width: `${Math.min(100, (t.currentCount / t.targetCount) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="task-count-badge">
                {t.currentCount} / {t.targetCount}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
