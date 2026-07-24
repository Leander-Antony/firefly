import { SoundEngine } from '../audio/SoundEngine';
import type {
  CameraState,
  CassetteTapeEntity,
  CinematicType,
  CoffeeBeanEntity,
  EasterEggEntity,
  FacingDirection,
  FireflyEntity,
  GameTask,
  InteractivePoint,
  LetterEntity,
  PerspectiveMode,
  PlayerState,
  SavedGameState,
  StoryChapter,
  StoryWaypoint,
  ZoneId,
} from '../types/game';
import { loadGameState, saveGameState } from '../utils/storage';
import { STORY_CHAPTERS, STORY_WAYPOINTS } from './storyData';
import { INITIAL_TASKS } from './taskSystem';
import {
  EASTER_EGGS,
  generateCoffeeBeans,
  generateFireflies,
  INITIAL_LETTERS,
  INITIAL_TAPES,
  INTERACTIVE_POINTS,
  ZONES,
} from './worldData';

export class GameEngine {
  public player: PlayerState = {
    x: 3000,
    y: 3000,
    vx: 0,
    vy: 0,
    facing: 'down',
    isWalking: false,
    isSitting: false,
    animFrame: 0,
    speed: 4.5,
    hasLantern: true,
  };

  public camera: CameraState = {
    x: 3000,
    y: 3000,
    targetX: 3000,
    targetY: 3000,
    zoom: 1.0,
  };

  public perspectiveMode: PerspectiveMode = 'topdown';
  public activeCinematicType: CinematicType = null;

  public fireflies: FireflyEntity[] = generateFireflies();
  public letters: LetterEntity[] = INITIAL_LETTERS;
  public tapes: CassetteTapeEntity[] = INITIAL_TAPES;
  public beans: CoffeeBeanEntity[] = generateCoffeeBeans();
  public easterEggs: EasterEggEntity[] = EASTER_EGGS;
  public interactivePoints: InteractivePoint[] = INTERACTIVE_POINTS;
  public storyChapters: StoryChapter[] = STORY_CHAPTERS;
  public storyWaypoints: StoryWaypoint[] = STORY_WAYPOINTS;
  public tasks: GameTask[] = INITIAL_TASKS;

  public activeStoryIndex: number = 0;
  public activeStoryWaypointModal: StoryWaypoint | null = null;

  public currentZone: ZoneId = 'central_glade';
  public nearInteractivePoint: InteractivePoint | null = null;
  public nearLetter: LetterEntity | null = null;
  public nearTape: CassetteTapeEntity | null = null;

  public savedState: SavedGameState = loadGameState();

  public benchStandSeconds: number = 0;
  public notebookOpenCount: number = 0;

  public hasCoffeeMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_1' && l.unlocked);
  }
  public hasFootballMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_3' && l.unlocked);
  }
  public hasNotebookMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_5' && l.unlocked);
  }
  public hasChocolateMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_7' && l.unlocked);
  }
  public hasCauliflowerMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_4' && l.unlocked);
  }
  public hasDreamMemory(): boolean {
    return this.letters.some((l) => l.id === 'letter_8' && l.unlocked);
  }

  public completedTaskToast: string | null = null;

  // Particle systems
  public leaves: Array<{ x: number; y: number; vx: number; vy: number; rot: number; color: string }> = [];
  public rainDrops: Array<{ x: number; y: number; length: number; speed: number }> = [];

  public windForce: number = 0.2;

  public targetWalkX: number | null = null;
  public targetWalkY: number | null = null;

  public activeModal: 'journal' | 'whisper_tree' | 'stone_skipping' | 'coffee_stand' | 'settings' | 'tasks' | 'prologue' | 'telescope' | 'bird_feeding' | null = null;

  public isEndingSequenceActive: boolean = false;
  public endingCutsceneProgress: number = 0;

  private keyState: Record<string, boolean> = {};

  constructor() {
    this.restoreSavedProgress();
    this.initParticles();
    this.updateTaskProgress();

    if (!this.savedState.hasSeenPrologue) {
      this.activeModal = 'prologue';
    }
  }

  private restoreSavedProgress(): void {
    this.fireflies.forEach((f) => {
      if (this.savedState.collectedFireflyIds.includes(f.id)) {
        f.collected = true;
      }
    });

    this.letters.forEach((l) => {
      if (this.savedState.unlockedLetterIds.includes(l.id)) {
        l.unlocked = true;
      }
    });

    this.tapes.forEach((t) => {
      if (this.savedState.unlockedTapeIds.includes(t.id)) {
        t.unlocked = true;
      }
    });

    this.beans.forEach((b) => {
      if (this.savedState.collectedBeanIds.includes(b.id)) {
        b.collected = true;
      }
    });

    this.easterEggs.forEach((e) => {
      if (this.savedState.foundEasterEggIds.includes(e.id)) {
        e.found = true;
      }
    });

    if (typeof this.savedState.activeStoryIndex === 'number') {
      this.activeStoryIndex = this.savedState.activeStoryIndex;
    }

    if (this.savedState.playerX > 100 && this.savedState.playerY > 100) {
      this.player.x = this.savedState.playerX;
      this.player.y = this.savedState.playerY;
    }
  }

  private initParticles(): void {
    for (let i = 0; i < 40; i++) {
      this.leaves.push({
        x: Math.random() * 6000,
        y: Math.random() * 6000,
        vx: 0.5 + Math.random() * 1.0,
        vy: 0.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        color: i % 2 === 0 ? '#b91c1c' : '#d97706',
      });
    }

    for (let r = 0; r < 60; r++) {
      this.rainDrops.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        length: 12 + Math.random() * 8,
        speed: 8 + Math.random() * 4,
      });
    }
  }

  public completePrologue(): void {
    this.savedState.hasSeenPrologue = true;
    saveGameState(this.savedState);
    this.activeModal = null;
  }

  public advanceStoryIndex(): void {
    this.activeStoryWaypointModal = null;
    if (this.activeStoryIndex < this.storyChapters.length) {
      this.storyChapters[this.activeStoryIndex].unlocked = true;
    }
    if (this.activeStoryIndex < this.storyWaypoints.length - 1) {
      this.activeStoryIndex += 1;
      this.savedState.activeStoryIndex = this.activeStoryIndex;
      saveGameState(this.savedState);
    } else {
      this.triggerEndingSequence();
    }
  }

  public is100PercentComplete(): boolean {
    const collectedCount = this.fireflies.filter((f) => f.collected).length;
    const unlockedLetters = this.letters.filter((l) => l.unlocked).length;
    return collectedCount >= 45 && unlockedLetters >= 12;
  }

  public getActiveStoryWaypoint(): StoryWaypoint | null {
    if (this.activeStoryIndex >= this.storyWaypoints.length) return null;
    return this.storyWaypoints[this.activeStoryIndex];
  }

  public getStoryObjectiveInfo(): { title: string; location: string; distanceMeters: number; directionStr: string } | null {
    const wp = this.getActiveStoryWaypoint();
    if (!wp) return null;

    const dx = wp.x - this.player.x;
    const dy = wp.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    let dir = '';
    if (dy < -50 && dx > 50) dir = 'Northeast';
    else if (dy < -50 && dx < -50) dir = 'Northwest';
    else if (dy > 50 && dx > 50) dir = 'Southeast';
    else if (dy > 50 && dx < -50) dir = 'Southwest';
    else if (dy < -50) dir = 'North';
    else if (dy > 50) dir = 'South';
    else if (dx < -50) dir = 'West';
    else if (dx > 50) dir = 'East';
    else dir = 'Nearby';

    return {
      title: wp.title,
      location: wp.locationName,
      distanceMeters: Math.round(dist / 10),
      directionStr: dir,
    };
  }

  public updateTaskProgress(): void {
    const collectedFireflies = this.fireflies.filter((f) => f.collected).length;
    const unlockedLetters = this.letters.filter((l) => l.unlocked).length;
    const unlockedTapes = this.tapes.filter((t) => t.unlocked).length;
    const coffeeBeans = this.savedState.coffeeCount;
    const whisperNotes = this.savedState.keptWhisperNotes.length;

    this.storyChapters.forEach((ch) => {
      if (collectedFireflies >= ch.requiredFireflies) {
        ch.unlocked = true;
        if (!this.savedState.unlockedStoryIds.includes(ch.id)) {
          this.savedState.unlockedStoryIds.push(ch.id);
          saveGameState(this.savedState);
        }
      }
    });

    this.tasks.forEach((t) => {
      if (t.id === 'task_1') t.currentCount = collectedFireflies;
      if (t.id === 'task_2') t.currentCount = unlockedLetters;
      if (t.id === 'task_3') t.currentCount = unlockedTapes;
      if (t.id === 'task_4') t.currentCount = coffeeBeans;
      if (t.id === 'task_5') t.currentCount = whisperNotes;
      if (t.id === 'task_6') t.currentCount = this.savedState.hasReachedEnding ? 1 : 0;

      if (t.currentCount >= t.targetCount && !t.completed) {
        t.completed = true;
        if (!this.savedState.completedTaskIds.includes(t.id)) {
          this.savedState.completedTaskIds.push(t.id);
          saveGameState(this.savedState);
          this.showTaskToast(t.title);
        }
      }
    });
  }

  public showTaskToast(title: string): void {
    this.completedTaskToast = title;
    SoundEngine.playFireflyCollect();
    setTimeout(() => {
      this.completedTaskToast = null;
    }, 4000);
  }

  public handleKeyDown(code: string): void {
    SoundEngine.resumeContext();
    this.keyState[code] = true;

    if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      if (this.player.isSitting) {
        this.player.isSitting = false;
        this.exitPerspectiveMode();
      }
      this.targetWalkX = null;
      this.targetWalkY = null;
    }

    if (code === 'KeyE') {
      this.triggerInteraction();
    }

    if (code === 'Space') {
      this.toggleSitting();
    }

    if (code === 'Escape') {
      this.exitPerspectiveMode();
    }
  }

  public handleKeyUp(code: string): void {
    this.keyState[code] = false;
  }

  public handleCanvasClick(worldX: number, worldY: number): void {
    SoundEngine.resumeContext();
    if (this.perspectiveMode === 'cinematic_side') {
      this.exitPerspectiveMode();
      return;
    }

    if (this.activeModal !== null) return;
    this.targetWalkX = Math.max(50, Math.min(5950, worldX));
    this.targetWalkY = Math.max(50, Math.min(5950, worldY));
    if (this.player.isSitting) {
      this.player.isSitting = false;
    }
  }

  public toggleSitting(): void {
    this.player.isSitting = !this.player.isSitting;
    if (this.player.isSitting) {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isWalking = false;
      this.enterPerspectiveMode('bench');

      if (this.currentZone === 'train_station' && Math.hypot(this.player.x - 1500, this.player.y - 5100) < 160) {
        this.enterPerspectiveMode('campfire');
        this.triggerEndingSequence();
      }
    } else {
      this.exitPerspectiveMode();
    }
  }

  public enterPerspectiveMode(type: CinematicType): void {
    this.perspectiveMode = 'cinematic_side';
    this.activeCinematicType = type;
  }

  public exitPerspectiveMode(): void {
    this.perspectiveMode = 'topdown';
    this.activeCinematicType = null;
    this.activeModal = null;
  }

  public triggerInteraction(): void {
    if (this.nearInteractivePoint) {
      const type = this.nearInteractivePoint.type;
      if (type === 'bench') {
        this.toggleSitting();
      } else if (type === 'whisper_tree') {
        this.enterPerspectiveMode('whisper_tree');
        this.activeModal = 'whisper_tree';
        SoundEngine.playPageFlip();
      } else if (type === 'stone_skipping') {
        this.enterPerspectiveMode('lake');
        this.activeModal = 'stone_skipping';
      } else if (type === 'coffee_stand') {
        this.enterPerspectiveMode('coffee');
        this.activeModal = 'coffee_stand';
        SoundEngine.playPageFlip();
      } else if (type === 'telescope') {
        this.activeModal = 'telescope';
        SoundEngine.playPageFlip();
      } else if (type === 'birds') {
        this.activeModal = 'bird_feeding';
        SoundEngine.playPageFlip();
      } else if (type === 'cat') {
        this.enterPerspectiveMode('cat');
        SoundEngine.playCatPurr();
      } else if (type === 'train_campfire') {
        this.toggleSitting();
      }
      return;
    }

    if (this.nearLetter) {
      this.unlockLetter(this.nearLetter.id);
      this.enterPerspectiveMode('letter');
      this.activeModal = 'journal';
      SoundEngine.playPageFlip();
      return;
    }

    if (this.nearTape) {
      this.unlockTape(this.nearTape.id);
      this.enterPerspectiveMode('tape');
      this.activeModal = 'journal';
      SoundEngine.playCassetteClick();
      return;
    }
  }

  public unlockLetter(letterId: string): void {
    const letter = this.letters.find((l) => l.id === letterId);
    if (letter && !letter.unlocked) {
      letter.unlocked = true;
      if (!this.savedState.unlockedLetterIds.includes(letterId)) {
        this.savedState.unlockedLetterIds.push(letterId);
        saveGameState(this.savedState);
      }
      this.updateTaskProgress();
    }
  }

  public unlockTape(tapeId: string): void {
    const tape = this.tapes.find((t) => t.id === tapeId);
    if (tape && !tape.unlocked) {
      tape.unlocked = true;
      if (!this.savedState.unlockedTapeIds.includes(tapeId)) {
        this.savedState.unlockedTapeIds.push(tapeId);
        saveGameState(this.savedState);
      }
      this.updateTaskProgress();
    }
  }

  public triggerEndingSequence(): void {
    if (this.isEndingSequenceActive) return;
    this.isEndingSequenceActive = true;
    this.savedState.hasReachedEnding = true;
    saveGameState(this.savedState);
    this.updateTaskProgress();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      this.endingCutsceneProgress = Math.min(1.0, progress);
      if (progress >= 1.0) {
        clearInterval(interval);
      }
    }, 100);
  }

  public update(viewportWidth: number, viewportHeight: number): void {
    this.updatePlayerMovement();
    this.updateCamera(viewportWidth, viewportHeight);
    this.updateFireflies();
    this.updateCollectibles();
    this.updateZoneDetection();
    this.updateStoryWaypointsCheck();
    this.updateParticles();
  }

  private updateStoryWaypointsCheck(): void {
    if (this.activeStoryWaypointModal !== null) return;
    const currentWp = this.getActiveStoryWaypoint();
    if (!currentWp) return;

    const dist = Math.hypot(this.player.x - currentWp.x, this.player.y - currentWp.y);
    if (dist < 90) {
      this.activeStoryWaypointModal = currentWp;
      SoundEngine.playFireflyCollect();
    }
  }

  private updatePlayerMovement(): void {
    if (this.player.isSitting || this.activeModal !== null || this.perspectiveMode === 'cinematic_side') {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isWalking = false;
      return;
    }

    let dx = 0;
    let dy = 0;

    if (this.keyState['KeyW'] || this.keyState['ArrowUp']) dy -= 1;
    if (this.keyState['KeyS'] || this.keyState['ArrowDown']) dy += 1;
    if (this.keyState['KeyA'] || this.keyState['ArrowLeft']) dx -= 1;
    if (this.keyState['KeyD'] || this.keyState['ArrowRight']) dx += 1;

    if (dx === 0 && dy === 0 && this.targetWalkX !== null && this.targetWalkY !== null) {
      const diffX = this.targetWalkX - this.player.x;
      const diffY = this.targetWalkY - this.player.y;
      const dist = Math.hypot(diffX, diffY);

      if (dist > 6) {
        dx = diffX / dist;
        dy = diffY / dist;
      } else {
        this.targetWalkX = null;
        this.targetWalkY = null;
      }
    }

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      const normX = dx / len;
      const normY = dy / len;

      this.player.vx = normX * this.player.speed;
      this.player.vy = normY * this.player.speed;
      this.player.isWalking = true;
      this.player.animFrame += 0.25;

      this.updateFacingDirection(normX, normY);

      if (Math.floor(this.player.animFrame) % 4 === 0 && Math.random() < 0.3) {
        SoundEngine.playFootstep();
      }
    } else {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isWalking = false;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    this.player.x = Math.max(40, Math.min(9960, this.player.x));
    this.player.y = Math.max(40, Math.min(9960, this.player.y));

    if (Math.floor(this.player.x) % 50 === 0 || Math.floor(this.player.y) % 50 === 0) {
      this.savedState.playerX = this.player.x;
      this.savedState.playerY = this.player.y;
      saveGameState(this.savedState);
    }
  }

  private updateFacingDirection(dx: number, dy: number): void {
    let facing: FacingDirection = 'down';
    if (dy < -0.4 && dx > 0.4) facing = 'up_right';
    else if (dy < -0.4 && dx < -0.4) facing = 'up_left';
    else if (dy > 0.4 && dx > 0.4) facing = 'down_right';
    else if (dy > 0.4 && dx < -0.4) facing = 'down_left';
    else if (dy < -0.5) facing = 'up';
    else if (dy > 0.5) facing = 'down';
    else if (dx < -0.5) facing = 'left';
    else if (dx > 0.5) facing = 'right';

    this.player.facing = facing;
  }

  private updateCamera(viewportWidth: number, viewportHeight: number): void {
    const targetX = this.player.x - viewportWidth / 2;
    const targetY = this.player.y - viewportHeight / 2;

    const minCamX = 0;
    const maxCamX = 10000 - viewportWidth;
    const minCamY = 0;
    const maxCamY = 10000 - viewportHeight;

    this.camera.targetX = Math.max(minCamX, Math.min(maxCamX, targetX));
    this.camera.targetY = Math.max(minCamY, Math.min(maxCamY, targetY));

    const lerpFactor = this.savedState.settings.reducedMotion ? 0.35 : 0.08;
    this.camera.x += (this.camera.targetX - this.camera.x) * lerpFactor;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerpFactor;

    const targetZoom = this.isEndingSequenceActive
      ? 0.75
      : this.perspectiveMode === 'cinematic_side'
      ? 0.82
      : this.player.isSitting
      ? 0.88
      : 1.0;
    this.camera.zoom += (targetZoom - this.camera.zoom) * 0.04;
  }

  private updateFireflies(): void {
    const time = Date.now() * 0.002;

    this.fireflies.forEach((f) => {
      if (f.collected) {
        if (this.isEndingSequenceActive) {
          const campfireX = 2000;
          const campfireY = 9200;
          const orbitR = 30 + Math.sin(time + parseFloat(f.id.replace('firefly_', ''))) * 45;
          const angle = time * 2 + parseFloat(f.id.replace('firefly_', '')) * 0.5;

          const targetX = campfireX + Math.cos(angle) * orbitR;
          const targetY = campfireY + Math.sin(angle) * orbitR;

          f.x += (targetX - f.x) * 0.05;
          f.y += (targetY - f.y) * 0.05;
        }
        return;
      }

      f.floatAngle += 0.03;
      f.x = f.baseX + Math.sin(f.floatAngle) * 18;
      f.y = f.baseY + Math.cos(f.floatAngle * 0.7) * 18;

      const dx = this.player.x - f.x;
      const dy = this.player.y - f.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 140) {
        f.x += dx * 0.22;
        f.y += dy * 0.22;

        if (dist < 45) {
          f.collected = true;
          SoundEngine.playFireflyCollect();

          if (!this.savedState.collectedFireflyIds.includes(f.id)) {
            this.savedState.collectedFireflyIds.push(f.id);
            saveGameState(this.savedState);
          }
          this.updateTaskProgress();
        }
      }
    });
  }

  private updateCollectibles(): void {
    this.beans.forEach((b) => {
      if (!b.collected && Math.hypot(this.player.x - b.x, this.player.y - b.y) < 45) {
        b.collected = true;
        this.savedState.coffeeCount += 1;
        if (!this.savedState.collectedBeanIds.includes(b.id)) {
          this.savedState.collectedBeanIds.push(b.id);
        }
        saveGameState(this.savedState);
        SoundEngine.playFireflyCollect();
        this.updateTaskProgress();
      }
    });

    let closestPoint: InteractivePoint | null = null;
    let minDist = 110;
    this.interactivePoints.forEach((pt) => {
      const dist = Math.hypot(this.player.x - pt.x, this.player.y - pt.y);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = pt;
      }
    });
    this.nearInteractivePoint = closestPoint;

    let closestLetter: LetterEntity | null = null;
    let minLetterDist = 75;
    this.letters.forEach((l) => {
      const dist = Math.hypot(this.player.x - l.x, this.player.y - l.y);
      if (dist < minLetterDist) {
        minLetterDist = dist;
        closestLetter = l;
      }
    });
    this.nearLetter = closestLetter;

    let closestTape: CassetteTapeEntity | null = null;
    let minTapeDist = 75;
    this.tapes.forEach((t) => {
      const dist = Math.hypot(this.player.x - t.x, this.player.y - t.y);
      if (dist < minTapeDist) {
        minTapeDist = dist;
        closestTape = t;
      }
    });
    this.nearTape = closestTape;
  }

  private updateZoneDetection(): void {
    const px = this.player.x;
    const py = this.player.y;
    const foundZone = ZONES.find((z) => px >= z.minX && px <= z.maxX && py >= z.minY && py <= z.maxY);

    if (foundZone && foundZone.id !== this.currentZone) {
      this.currentZone = foundZone.id;
      SoundEngine.setZoneAmbient(foundZone.ambientSound);

      if (!this.savedState.visitedZones.includes(foundZone.id)) {
        this.savedState.visitedZones.push(foundZone.id);
        saveGameState(this.savedState);
      }
    }
  }

  private updateParticles(): void {
    this.leaves.forEach((l) => {
      l.x += l.vx + Math.sin(Date.now() * 0.002 + l.y * 0.01) * 0.8;
      l.y += l.vy;
      l.rot += 0.02;

      if (l.y > 6000 || l.x > 6000) {
        l.y = Math.random() * 6000;
        l.x = Math.random() * 6000;
      }
    });

    if (this.currentZone === 'rain_bench') {
      this.rainDrops.forEach((r) => {
        r.y += r.speed;
        r.x += 1.5;
        if (r.y > this.camera.y + 800) {
          r.y = this.camera.y - 20;
          r.x = this.camera.x + Math.random() * 1200;
        }
      });
    }
  }
}
