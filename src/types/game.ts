export interface Vector2D {
  x: number;
  y: number;
}

export type FacingDirection = 
  | 'down' 
  | 'up' 
  | 'left' 
  | 'right' 
  | 'up_left' 
  | 'up_right' 
  | 'down_left' 
  | 'down_right';

export type PerspectiveMode = 'topdown' | 'cinematic_side';

export type CinematicType = 
  | 'bench' 
  | 'whisper_tree' 
  | 'lake' 
  | 'coffee' 
  | 'letter' 
  | 'tape' 
  | 'cat' 
  | 'campfire' 
  | null;

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: FacingDirection;
  isWalking: boolean;
  isSitting: boolean;
  sittingTargetId?: string;
  animFrame: number;
  speed: number;
  hasLantern: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zoom: number;
}

export type ZoneId = 
  | 'central_glade'
  | 'meadow'
  | 'rain_bench'
  | 'coffee_corner'
  | 'lake'
  | 'whisper_tree'
  | 'memory_hollow'
  | 'train_station'
  | 'arcade_ruins'
  | 'starlight_bridge'
  | 'cauliflower_ridge'
  | 'observatory';

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  description: string;
  ambientSound: 'forest' | 'rain' | 'stream' | 'wind' | 'station';
}

export interface FireflyEntity {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  collected: boolean;
  color: string;
  radius: number;
  pulsePhase: number;
  floatAngle: number;
  speed: number;
  zoneId: ZoneId;
}

export interface LetterEntity {
  id: string;
  title: string;
  content: string;
  locationName: string;
  x: number;
  y: number;
  zoneId: ZoneId;
  unlocked: boolean;
}

export interface CassetteTapeEntity {
  id: string;
  songTitle: string;
  artist: string;
  description: string;
  x: number;
  y: number;
  zoneId: ZoneId;
  unlocked: boolean;
  spotifyQuery: string;
  albumArtColor: string;
}

export interface CoffeeBeanEntity {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  content: string;
  requiredFireflies: number;
  unlocked: boolean;
}

export type SpeakerAvatarType = 'evelyn' | 'traveler' | 'tree' | 'kiosk' | 'cat';

export interface StoryWaypoint {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  locationName: string;
  x: number;
  y: number;
  dialogText: string;
  speakerName: string;
  speakerAvatar: SpeakerAvatarType;
  completed: boolean;
  zoneId: ZoneId;
}

export interface GameTask {
  id: string;
  title: string;
  description: string;
  currentCount: number;
  targetCount: number;
  completed: boolean;
}

export interface InteractivePoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 
    | 'bench'
    | 'whisper_tree'
    | 'coffee_stand'
    | 'stone_skipping'
    | 'cat'
    | 'birds'
    | 'lantern'
    | 'easter_egg'
    | 'train_campfire';
  label: string;
  zoneId: ZoneId;
  extraData?: any;
}

export interface EasterEggEntity {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  found: boolean;
  iconName: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  content: string;
}

export interface WhisperNote {
  id: string;
  date: string;
  content: string;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume: number;
  muted: boolean;
  fullscreen: boolean;
  reducedMotion: boolean;
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  largeText: boolean;
  cloakStyle: 'violet' | 'emerald' | 'azure' | 'amber' | 'rose';
  lanternGlow: 'amber' | 'gold' | 'cyan' | 'emerald' | 'violet';
  keymap: {
    up: string;
    down: string;
    left: string;
    right: string;
    interact: string;
    sit: string;
    journal: string;
  };
}

export interface SavedGameState {
  collectedFireflyIds: string[];
  unlockedLetterIds: string[];
  unlockedTapeIds: string[];
  collectedBeanIds: string[];
  foundEasterEggIds: string[];
  litLanternIds: string[];
  unlockedStoryIds: string[];
  completedTaskIds: string[];
  activeStoryIndex: number;
  hasSeenPrologue: boolean;
  journalEntries: JournalEntry[];
  keptWhisperNotes: WhisperNote[];
  coffeeCount: number;
  coffeeMessagesUnlocked: string[];
  playerX: number;
  playerY: number;
  visitedZones: ZoneId[];
  hasReachedEnding: boolean;
  settings: GameSettings;
}

export interface RenderableObject {
  y: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}
