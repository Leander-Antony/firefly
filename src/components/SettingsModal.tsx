import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Maximize, Eye, Keyboard, Sliders, UserCheck, Sparkles, RotateCcw, Check } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState, DEFAULT_SETTINGS } from '../utils/storage';
import { ProceduralArt } from '../game/proceduralArt';
import type { GameSettings } from '../types/game';

interface SettingsModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ engine, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'audio' | 'display' | 'customization' | 'controls'>('audio');

  const [settings, setSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...engine.savedState.settings,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    engine.savedState.settings = updated;
    SoundEngine.updateSettings(updated);
    saveGameState(engine.savedState);
  };

  // Live Canvas Preview for Character Customization
  useEffect(() => {
    if (activeCategory !== 'customization') return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animFrame = 0;

    const renderPreview = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGlow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 + 15,
        5,
        canvas.width / 2,
        canvas.height / 2 + 15,
        85
      );
      bgGlow.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ProceduralArt.drawTopDownPlayer(
        ctx,
        canvas.width / 2,
        canvas.height / 2 + 15,
        'down',
        true,
        false,
        animFrame,
        settings.cloakStyle || 'violet',
        settings.lanternGlow || 'amber'
      );

      animFrame += 0.2;
      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [activeCategory, settings.cloakStyle, settings.lanternGlow]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      updateSetting('fullscreen', true);
    } else {
      document.exitFullscreen().catch(() => {});
      updateSetting('fullscreen', false);
    }
  };

  const playTestAudio = () => {
    SoundEngine.init();
    SoundEngine.playFireflyCollect();
  };

  const resetKeybindings = () => {
    updateSetting('keymap', { ...DEFAULT_SETTINGS.keymap });
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="settings-modal-box"
      >
        {/* Frame Pinned Close Button */}
        <button
          onClick={onClose}
          className="settings-close-btn"
          title="Close Settings"
        >
          <X size={20} />
        </button>

        {/* Left Navigation Sidebar */}
        <aside className="settings-sidebar">
          <div>
            <div className="settings-sidebar-header">
              <div className="icon-box">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="title-text">Settings</h2>
                <p className="sub-text">Firefly Diaries</p>
              </div>
            </div>

            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveCategory('audio')}
                className={`sidebar-tab ${activeCategory === 'audio' ? 'active' : ''}`}
              >
                <Volume2 size={18} /> <span>Audio & Sound</span>
              </button>
              <button
                onClick={() => setActiveCategory('display')}
                className={`sidebar-tab ${activeCategory === 'display' ? 'active' : ''}`}
              >
                <Eye size={18} /> <span>Display & Vision</span>
              </button>
              <button
                onClick={() => setActiveCategory('customization')}
                className={`sidebar-tab ${activeCategory === 'customization' ? 'active' : ''}`}
              >
                <UserCheck size={18} /> <span>Traveler Style</span>
              </button>
              <button
                onClick={() => setActiveCategory('controls')}
                className={`sidebar-tab ${activeCategory === 'controls' ? 'active' : ''}`}
              >
                <Keyboard size={18} /> <span>Controls Reference</span>
              </button>
            </div>
          </div>

          <div className="sidebar-footer">
            ✨ Settings auto-save to browser
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="settings-content-panel custom-scrollbar">
          {/* 1. AUDIO & SOUND */}
          {activeCategory === 'audio' && (
            <div>
              <div className="settings-section-header">
                <div>
                  <h3 className="h-title">Audio & Volume Controls</h3>
                  <p className="h-sub">Adjust ambient music and sound effect levels</p>
                </div>
                <button
                  onClick={playTestAudio}
                  className="ui-btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <Sparkles size={14} /> Test Chime
                </button>
              </div>

              <div className="settings-card-group">
                <div className="settings-card-item">
                  <div className="settings-label-row">
                    <span className="label-title">Master Volume</span>
                    <span className="val-badge">{Math.round(settings.masterVolume * 100)}%</span>
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

                <div className="settings-card-item">
                  <div className="settings-label-row">
                    <span className="label-title">Minimal Piano Music</span>
                    <span className="val-badge">{Math.round(settings.musicVolume * 100)}%</span>
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

                <div className="settings-card-item">
                  <div className="settings-label-row">
                    <span className="label-title">Forest Ambience (Rain, Wind, Crickets)</span>
                    <span className="val-badge">{Math.round(settings.ambientVolume * 100)}%</span>
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

                <div className="settings-card-item">
                  <div className="settings-label-row">
                    <span className="label-title">Sound Effects (Footsteps, Fireflies)</span>
                    <span className="val-badge">{Math.round(settings.sfxVolume * 100)}%</span>
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
              </div>
            </div>
          )}

          {/* 2. DISPLAY & VISION */}
          {activeCategory === 'display' && (
            <div>
              <div className="settings-section-header">
                <div>
                  <h3 className="h-title">Display & Visual Accessibility</h3>
                  <p className="h-sub">Customize graphics, text sizing, and colorblind filters</p>
                </div>
              </div>

              <div className="settings-card-group">
                <div className="settings-card-toggle-item">
                  <div>
                    <div className="label-title">Fullscreen Mode</div>
                    <div className="h-sub">Expand game to fill your monitor</div>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="ui-btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    <Maximize size={14} /> Toggle
                  </button>
                </div>

                <div className="settings-card-toggle-item">
                  <div>
                    <div className="label-title">Reduced Motion</div>
                    <div className="h-sub">Smooth camera tracking & disable UI oscillation</div>
                  </div>
                  <div
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`toggle-switch-track ${settings.reducedMotion ? 'active' : ''}`}
                    title="Toggle Reduced Motion"
                  >
                    <div className="toggle-switch-knob" />
                  </div>
                </div>

                <div className="settings-card-toggle-item">
                  <div>
                    <div className="label-title">Large Text Display</div>
                    <div className="h-sub">Scale up letter & dialogue font sizes</div>
                  </div>
                  <div
                    onClick={() => updateSetting('largeText', !settings.largeText)}
                    className={`toggle-switch-track ${settings.largeText ? 'active' : ''}`}
                    title="Toggle Large Text Display"
                  >
                    <div className="toggle-switch-knob" />
                  </div>
                </div>

                <div className="settings-card-item">
                  <div className="label-title">Colorblind Support Filter</div>
                  <div className="h-sub" style={{ marginTop: 0 }}>Calibrate game colors for visual accessibility</div>
                  <select
                    value={settings.colorblindMode}
                    onChange={(e) => updateSetting('colorblindMode', e.target.value as any)}
                    className="settings-select"
                    style={{ marginTop: '6px' }}
                  >
                    <option value="none">None (Default Twilight Palette)</option>
                    <option value="deuteranopia">Deuteranopia (Red-Green Filter)</option>
                    <option value="protanopia">Protanopia (Red Weakness Filter)</option>
                    <option value="tritanopia">Tritanopia (Blue-Yellow Filter)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. TRAVELER STYLE CUSTOMIZATION */}
          {activeCategory === 'customization' && (
            <div>
              <div className="settings-section-header">
                <div>
                  <h3 className="h-title">Traveler Character Style</h3>
                  <p className="h-sub">Personalize your cloak hood and lantern light aura</p>
                </div>
              </div>

              <div className="customization-layout">
                {/* Live Character Avatar Preview */}
                <div className="avatar-preview-card">
                  <span className="preview-title">Live Avatar Preview</span>
                  <canvas
                    ref={previewCanvasRef}
                    width={200}
                    height={150}
                    className="preview-canvas"
                  />
                </div>

                {/* Cloak & Lantern Swatch Selectors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Cloak Colors */}
                  <div className="settings-card-item">
                    <span className="label-title" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fef08a' }}>
                      Cloak Hood Color
                    </span>
                    <div className="swatch-group">
                      {(
                        [
                          { id: 'violet', name: 'Violet', bg: 'linear-gradient(135deg, #312e81, #c084fc)' },
                          { id: 'emerald', name: 'Emerald', bg: 'linear-gradient(135deg, #064e3b, #34d399)' },
                          { id: 'azure', name: 'Azure', bg: 'linear-gradient(135deg, #0c4a6e, #38bdf8)' },
                          { id: 'amber', name: 'Amber', bg: 'linear-gradient(135deg, #78350f, #fbbf24)' },
                          { id: 'rose', name: 'Rose', bg: 'linear-gradient(135deg, #831843, #f472b6)' },
                        ] as const
                      ).map((c) => {
                        const isSelected = (settings.cloakStyle || 'violet') === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => updateSetting('cloakStyle', c.id)}
                            className={`swatch-btn ${isSelected ? 'selected' : ''}`}
                          >
                            <div className="swatch-circle" style={{ background: c.bg }}>
                              {isSelected && <Check size={14} className="text-white drop-shadow" />}
                            </div>
                            <span className="swatch-name">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lantern Colors */}
                  <div className="settings-card-item">
                    <span className="label-title" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
                      Lantern Light Aura
                    </span>
                    <div className="swatch-group">
                      {(
                        [
                          { id: 'amber', name: 'Amber', color: '#fb923c' },
                          { id: 'gold', name: 'Gold', color: '#fef08a' },
                          { id: 'cyan', name: 'Cyan', color: '#38bdf8' },
                          { id: 'emerald', name: 'Emerald', color: '#34d399' },
                          { id: 'violet', name: 'Violet', color: '#c084fc' },
                        ] as const
                      ).map((g) => {
                        const isSelected = (settings.lanternGlow || 'amber') === g.id;
                        return (
                          <button
                            key={g.id}
                            onClick={() => updateSetting('lanternGlow', g.id)}
                            className={`swatch-btn ${isSelected ? 'selected' : ''}`}
                          >
                            <div className="swatch-circle" style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}` }}>
                              {isSelected && <Check size={14} className="text-slate-950 drop-shadow" />}
                            </div>
                            <span className="swatch-name">{g.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. CONTROLS REFERENCE */}
          {activeCategory === 'controls' && (
            <div>
              <div className="settings-section-header">
                <div>
                  <h3 className="h-title">Controls & Keybindings Reference</h3>
                  <p className="h-sub">Keyboard shortcuts & mouse interactions</p>
                </div>
                <button
                  onClick={resetKeybindings}
                  className="ui-btn"
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>

              <div className="settings-card-group">
                <div className="settings-card-toggle-item">
                  <span className="label-title">8-Way Open World Walking</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="key-cap">W</span>
                    <span className="key-cap">A</span>
                    <span className="key-cap">S</span>
                    <span className="key-cap">D</span>
                  </div>
                </div>

                <div className="settings-card-toggle-item">
                  <span className="label-title">Click / Tap Ground Movement</span>
                  <span className="val-badge" style={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.3)', background: 'rgba(192,132,252,0.1)' }}>
                    Click ground position
                  </span>
                </div>

                <div className="settings-card-toggle-item">
                  <span className="label-title">Interact / Inspect Story Notes</span>
                  <span className="key-cap">{settings.keymap?.interact?.replace('Key', '') || 'E'}</span>
                </div>

                <div className="settings-card-toggle-item">
                  <span className="label-title">Sit on Bench / Stand up</span>
                  <span className="key-cap">{settings.keymap?.sit || 'Space'}</span>
                </div>


                <div className="settings-card-toggle-item">
                  <span className="label-title">Exit Perspective View / Close Modals</span>
                  <span className="key-cap">ESC</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </motion.div>
    </div>
  );
};
