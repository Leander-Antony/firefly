import React from 'react';
import { BookOpen, Coffee, Volume2, VolumeX, Settings, Sparkles, MapPin, ArrowLeft, Compass, CheckCircle2, Navigation } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { ZONES } from '../game/worldData';
import { MinimapWidget } from './MinimapWidget';

interface UIOverlayProps {
  engine: GameEngine;
  onOpenTasks: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  engine,
  onOpenTasks,
  onOpenSettings,
  onToggleMute,
  isMuted,
}) => {
  const collectedFireflies = engine.fireflies.filter((f) => f.collected).length;
  const currentZoneInfo = ZONES.find((z) => z.id === engine.currentZone) || ZONES[0];
  const completedTasksCount = engine.tasks.filter((t) => t.completed).length;

  const storyObj = engine.getStoryObjectiveInfo();

  const nearPrompt =
    engine.nearInteractivePoint?.label ||
    (engine.nearLetter ? `Read Letter: "${engine.nearLetter.title}"` : null) ||
    (engine.nearTape ? `Discover Cassette Tape: "${engine.nearTape.songTitle}"` : null) ||
    (engine.nearEasterEgg ? `Discover Secret: ${engine.nearEasterEgg.name}` : null);

  const isCinematicMode = engine.perspectiveMode === 'cinematic_side';

  return (
    <div className="ui-overlay-container pointer-events-none">
      {/* Top Header Bar */}
      <header className="top-bar pointer-events-auto">
        <div className="game-title">
          <Sparkles className="icon-sparkle" size={20} />
          <span>Firefly Diaries</span>
        </div>

        {/* Current Zone Badge */}
        <div className="zone-badge animate-pulse-subtle" key={engine.currentZone}>
          <MapPin size={16} className="text-purple-300" />
          <span>{currentZoneInfo.name}</span>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Cinematic Side View Exit button */}
          {isCinematicMode && (
            <button
              onClick={() => engine.exitPerspectiveMode()}
              className="ui-btn bg-purple-600/40 text-purple-200 border-purple-400/40"
              title="Return to Open World (ESC)"
            >
              <ArrowLeft size={16} />
              <span>Return to World</span>
            </button>
          )}

          {/* Tasks Tracker Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTasks();
            }}
            className="ui-btn-icon relative pointer-events-auto cursor-pointer"
            title="Traveler's Tasks"
          >
            <Compass size={18} />
            {completedTasksCount > 0 && (
              <span className="task-badge-dot">{completedTasksCount}</span>
            )}
          </button>

          {/* Firefly Counter */}
          <div className="firefly-counter" title="Collected Fireflies">
            <span className="counter-icon">✨</span>
            <span className="counter-text">{collectedFireflies} / 50</span>
          </div>

          {/* Coffee Count */}
          {engine.savedState.coffeeCount > 0 && (
            <div className="coffee-counter" title="Coffee Beans">
              <Coffee size={16} className="text-amber-400" />
              <span>{engine.savedState.coffeeCount}</span>
            </div>
          )}


          {/* Mute Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="ui-btn-icon pointer-events-auto cursor-pointer"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="ui-btn-icon pointer-events-auto cursor-pointer"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Guided Story Objective Compass Banner */}
      {!isCinematicMode && (
        <div className="story-objective-banner pointer-events-auto">
          <div className="story-banner-card">
            <Navigation size={18} className="text-amber-300 animate-pulse" />
            <div className="story-banner-text">
              {storyObj ? (
                <>
                  <span className="story-banner-label">Story Goal:</span>
                  <span className="story-banner-title">{storyObj.title}</span>
                  <span className="story-banner-dist">
                    — Head {storyObj.directionStr} to {storyObj.location} ({storyObj.distanceMeters}m)
                  </span>
                </>
              ) : (
                <>
                  <span className="story-banner-label text-emerald-300 font-bold">✨ All Chapters Complete!</span>
                  <span className="story-banner-title">Free Exploration</span>
                  <span className="story-banner-dist">
                    — Explore the forest to find 100% of secrets ({collectedFireflies}/50 fireflies)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimap Radar Widget in Bottom-Right Corner */}
      {!isCinematicMode && <MinimapWidget engine={engine} />}

      {/* Task Completion Toast Popup */}
      {engine.completedTaskToast && (
        <div className="task-toast-container pointer-events-auto">
          <div className="task-toast-card">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <div>
              <div className="task-toast-label">Task Completed!</div>
              <div className="task-toast-title">{engine.completedTaskToast}</div>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Prompt Box at Bottom */}
      {!isCinematicMode && nearPrompt && (
        <div className="interaction-prompt pointer-events-auto">
          <div className="prompt-bubble animate-bounce">
            <span className="key-cap">E</span>
            <span className="prompt-text">{nearPrompt}</span>
          </div>
        </div>
      )}

      {/* Sit / Rest Hint */}
      {!isCinematicMode && !nearPrompt && engine.player.isSitting && (
        <div className="interaction-prompt pointer-events-auto">
          <div className="prompt-bubble">
            <span className="prompt-text">Resting... Press Space to stand up</span>
          </div>
        </div>
      )}

      {/* Cinematic View Return Hint */}
      {isCinematicMode && (
        <div className="interaction-prompt pointer-events-auto">
          <div className="prompt-bubble bg-purple-900/80 border-purple-400">
            <span className="key-cap">ESC</span>
            <span className="prompt-text">Click anywhere or press ESC to return to Open World</span>
          </div>
        </div>
      )}
    </div>
  );
};
