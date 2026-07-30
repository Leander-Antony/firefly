import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { LetterModal } from './components/LetterModal';
import { WhisperTreeModal } from './components/WhisperTreeModal';
import { StoneSkippingModal } from './components/StoneSkippingModal';
import { CoffeeStandModal } from './components/CoffeeStandModal';
import { ArcadeModal } from './components/ArcadeModal';
import { SettingsModal } from './components/SettingsModal';
import { TaskTrackerModal } from './components/TaskTrackerModal';
import { PrologueCutscene } from './components/PrologueCutscene';
import { RPGDialogueBox } from './components/RPGDialogueBox';
import { EndingScreen } from './components/EndingScreen';
import { SoundEngine } from './audio/SoundEngine';
import { TelescopeModal } from './components/TelescopeModal';
import { BirdFeedingModal } from './components/BirdFeedingModal';

export function App() {
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  const [activeModal, setActiveModal] = useState<
    'letter' | 'whisper_tree' | 'stone_skipping' | 'coffee_stand' | 'arcade' | 'settings' | 'tasks' | 'prologue' | 'telescope' | 'bird_feeding' | null
  >(engine.activeModal);

  const [isMuted, setIsMuted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [storyWaypointModal, setStoryWaypointModal] = useState(engine.activeStoryWaypointModal);

  // 60FPS Live HUD Distance & State Ticker
  const [, setTick] = useState(0);

  useEffect(() => {
    let animId: number;

    const tickLoop = () => {
      setTick((t) => (t + 1) % 1000);

      if (engine.activeModal !== activeModal) {
        setActiveModal(engine.activeModal);
      }
      if (engine.activeStoryWaypointModal !== storyWaypointModal) {
        setStoryWaypointModal(engine.activeStoryWaypointModal);
      }
      if (engine.isEndingSequenceActive && !isEnding) {
        setIsEnding(true);
      }

      animId = requestAnimationFrame(tickLoop);
    };

    animId = requestAnimationFrame(tickLoop);
    return () => cancelAnimationFrame(animId);
  }, [activeModal, storyWaypointModal, isEnding, engine]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      SoundEngine.init();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleStartPrologue = () => {
    engine.completePrologue();
    setActiveModal(null);
  };

  const handleContinueStory = () => {
    engine.advanceStoryIndex();
    setStoryWaypointModal(null);
  };


  const handleOpenTasks = () => {
    engine.openModal('tasks');
    setActiveModal('tasks');
    SoundEngine.playPageFlip();
  };

  const handleOpenSettings = () => {
    engine.openModal('settings');
    setActiveModal('settings');
  };

  const handleCloseModal = () => {
    engine.closeModal();
    setActiveModal(null);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    engine.savedState.settings.muted = nextMute;
    SoundEngine.updateSettings(engine.savedState.settings);
  };

  const handleReplay = () => {
    window.location.reload();
  };

  const colorblindClass =
    engine.savedState.settings.colorblindMode !== 'none'
      ? `colorblind-${engine.savedState.settings.colorblindMode}`
      : '';

  const largeTextClass = engine.savedState.settings.largeText ? 'large-text' : '';

  return (
    <div className={`app-wrapper ${colorblindClass} ${largeTextClass}`}>
      {/* 2D Canvas Visual Engine */}
      <GameCanvas engine={engine} />

      {/* Main HUD overlay */}
      <UIOverlay
        engine={engine}
        onOpenTasks={handleOpenTasks}
        onOpenSettings={handleOpenSettings}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
      />

      {/* Opening Prologue Cutscene */}
      {activeModal === 'prologue' && (
        <PrologueCutscene onStart={handleStartPrologue} />
      )}

      {/* RPG-Style Bottom Dialogue Box */}
      {storyWaypointModal && (
        <RPGDialogueBox waypoint={storyWaypointModal} onContinue={handleContinueStory} />
      )}


      {/* Modals */}
      {activeModal === 'letter' && engine.nearLetter && (
        <LetterModal letter={engine.nearLetter} onClose={handleCloseModal} />
      )}

      {activeModal === 'tasks' && (
        <TaskTrackerModal engine={engine} onClose={handleCloseModal} />
      )}

      {activeModal === 'whisper_tree' && (
        <WhisperTreeModal engine={engine} onClose={handleCloseModal} />
      )}

      {activeModal === 'stone_skipping' && (
        <StoneSkippingModal onClose={handleCloseModal} />
      )}

      {activeModal === 'coffee_stand' && (
        <CoffeeStandModal engine={engine} onClose={handleCloseModal} />
      )}

      {activeModal === 'arcade' && (
        <ArcadeModal engine={engine} onClose={handleCloseModal} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal engine={engine} onClose={handleCloseModal} />
      )}

      {activeModal === 'telescope' && (
        <TelescopeModal onClose={handleCloseModal} />
      )}

      {activeModal === 'bird_feeding' && (
        <BirdFeedingModal onClose={handleCloseModal} />
      )}

      {/* Cutscene Ending Screen */}
      {isEnding && (
        <EndingScreen
          engine={engine}
          onReplay={handleReplay}
          onContinueExploring={() => {
            engine.isEndingSequenceActive = false;
            engine.endingCutsceneProgress = 0;
            engine.exitPerspectiveMode();
            setIsEnding(false);
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

export default App;
