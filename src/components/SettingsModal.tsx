import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Maximize, Eye, Keyboard, Sliders } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';

interface SettingsModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ engine, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'audio' | 'display' | 'controls'>('audio');
  const settings = engine.savedState.settings;

  const updateSetting = (key: keyof typeof settings, value: any) => {
    (engine.savedState.settings as any)[key] = value;
    SoundEngine.updateSettings(engine.savedState.settings);
    saveGameState(engine.savedState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      updateSetting('fullscreen', true);
    } else {
      document.exitFullscreen().catch(() => {});
      updateSetting('fullscreen', false);
    }
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="settings-modal-card custom-scrollbar"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders size={22} className="text-amber-300" />
            <h2 className="text-xl font-serif text-amber-100">Settings & Customization</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="journal-tabs mb-4">
          <button
            className={`tab-btn ${activeCategory === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveCategory('audio')}
          >
            <Volume2 size={16} /> Audio Volume
          </button>
          <button
            className={`tab-btn ${activeCategory === 'display' ? 'active' : ''}`}
            onClick={() => setActiveCategory('display')}
          >
            <Eye size={16} /> Display & Filters
          </button>
          <button
            className={`tab-btn ${activeCategory === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveCategory('controls')}
          >
            <Keyboard size={16} /> Controls Reference
          </button>
        </div>

        {/* Audio Category */}
        {activeCategory === 'audio' && (
          <section className="settings-section space-y-4">
            <div className="setting-slider-group">
              <div className="flex justify-between text-xs text-amber-200 font-medium mb-1">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                className="golden-slider"
              />
            </div>

            <div className="setting-slider-group">
              <div className="flex justify-between text-xs text-purple-200 font-medium mb-1">
                <span>Minimal Piano Music</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                className="golden-slider"
              />
            </div>

            <div className="setting-slider-group">
              <div className="flex justify-between text-xs text-sky-200 font-medium mb-1">
                <span>Forest Ambience (Rain, Wind, Crickets)</span>
                <span>{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={(e) => updateSetting('ambientVolume', Number(e.target.value))}
                className="golden-slider"
              />
            </div>

            <div className="setting-slider-group">
              <div className="flex justify-between text-xs text-amber-300 font-medium mb-1">
                <span>Sound Effects (Footsteps, Fireflies)</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                className="golden-slider"
              />
            </div>
          </section>
        )}

        {/* Display Category */}
        {activeCategory === 'display' && (
          <section className="settings-section space-y-3">
            <div className="setting-row-toggle">
              <div>
                <div className="font-semibold text-slate-100 text-sm">Fullscreen Display</div>
                <div className="text-xs text-slate-400">Expand game viewport to fill your screen</div>
              </div>
              <button onClick={toggleFullscreen} className="ui-btn-primary text-xs py-1 px-3">
                <Maximize size={14} /> Toggle
              </button>
            </div>

            <div className="setting-row-toggle">
              <div>
                <div className="font-semibold text-slate-100 text-sm">Reduced Motion</div>
                <div className="text-xs text-slate-400">Minimize camera spring oscillations</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="styled-checkbox"
              />
            </div>

            <div className="setting-row-toggle">
              <div>
                <div className="font-semibold text-slate-100 text-sm">Large Text Display</div>
                <div className="text-xs text-slate-400">Increase letter and journal font size</div>
              </div>
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={(e) => updateSetting('largeText', e.target.checked)}
                className="styled-checkbox"
              />
            </div>

            <div className="setting-row mt-3">
              <label className="text-xs font-semibold text-purple-200 mb-1">Colorblind Support Filter</label>
              <select
                value={settings.colorblindMode}
                onChange={(e) => updateSetting('colorblindMode', e.target.value)}
                className="settings-select"
              >
                <option value="none">None (Default)</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="protanopia">Protanopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </div>
          </section>
        )}

        {/* Controls Category */}
        {activeCategory === 'controls' && (
          <section className="settings-section">
            <div className="keymap-grid space-y-2 text-sm text-slate-200">
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>8-Way Open World Walking</span>
                <div>
                  <span className="key-cap">W</span> <span className="key-cap">A</span> <span className="key-cap">S</span> <span className="key-cap">D</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>Ground Navigation</span>
                <span className="text-xs text-purple-300 font-medium">Click / Tap Anywhere</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>Interact / Inspect</span>
                <span className="key-cap">E</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>Sit on Bench / Stand up</span>
                <span className="key-cap">Space</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>Open Traveler's Journal</span>
                <span className="key-cap">J</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white/5">
                <span>Exit Side View</span>
                <span className="key-cap">ESC</span>
              </div>
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
};
