import type { GameSettings, SavedGameState } from '../types/game';

const STORAGE_KEY = 'firefly_diaries_save_v5_remember';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.8,
  musicVolume: 0.7,
  ambientVolume: 0.9,
  muted: false,
  fullscreen: false,
  reducedMotion: false,
  colorblindMode: 'none',
  largeText: false,
  cloakStyle: 'violet',
  lanternGlow: 'amber',
  keymap: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    interact: 'KeyE',
    sit: 'Space',
    journal: 'KeyJ',
  },
};

export const INITIAL_SAVE_STATE: SavedGameState = {
  collectedFireflyIds: [],
  unlockedLetterIds: [],
  unlockedTapeIds: [],
  collectedBeanIds: [],
  foundEasterEggIds: [],
  litLanternIds: [],
  unlockedStoryIds: ['story_1'],
  completedTaskIds: [],
  activeStoryIndex: 0,
  hasSeenPrologue: false,
  journalEntries: [],
  keptWhisperNotes: [],
  coffeeCount: 0,
  coffeeMessagesUnlocked: [],
  playerX: 5000,
  playerY: 5000,
  visitedZones: ['central_glade'],
  hasReachedEnding: false,
  settings: DEFAULT_SETTINGS,
};

export function loadGameState(): SavedGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SAVE_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SAVE_STATE,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        keymap: {
          ...DEFAULT_SETTINGS.keymap,
          ...((parsed.settings && parsed.settings.keymap) || {}),
        },
      },
    };
  } catch (err) {
    console.warn('Failed to load save state from LocalStorage:', err);
    return INITIAL_SAVE_STATE;
  }
}

export function saveGameState(state: Partial<SavedGameState>): void {
  try {
    const current = loadGameState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save state to LocalStorage:', err);
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear save state:', err);
  }
}
