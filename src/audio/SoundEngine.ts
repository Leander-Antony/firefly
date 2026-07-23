import type { GameSettings } from '../types/game';

class SoundEngineManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master Gain Nodes
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Ambient loop sources & nodes
  private windGainNode: GainNode | null = null;
  private rainGainNode: GainNode | null = null;

  // Sound settings
  private settings: GameSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.7,
    ambientVolume: 0.9,
    muted: false,
    fullscreen: false,
    reducedMotion: false,
    colorblindMode: 'none',
    largeText: false,
    keymap: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', interact: 'KeyE', sit: 'Space', journal: 'KeyJ' }
  };

  private currentZoneSound: string = 'forest';

  public init(): void {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolumes();
      this.startAmbientGenerators();
      this.startBackgroundMusicLoop();

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed or blocked:', e);
    }
  }

  public resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(newSettings: GameSettings): void {
    this.settings = { ...newSettings };
    this.updateVolumes();
  }

  private updateVolumes(): void {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain || !this.ambientGain) return;

    const mutedMultiplier = this.settings.muted ? 0 : 1;
    this.masterGain.gain.setTargetAtTime(this.settings.masterVolume * mutedMultiplier, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume, this.ctx.currentTime, 0.05);
    this.musicGain.gain.setTargetAtTime(this.settings.musicVolume, this.ctx.currentTime, 0.05);
    this.ambientGain.gain.setTargetAtTime(this.settings.ambientVolume, this.ctx.currentTime, 0.05);
  }

  // --- PROCEDURAL AMBIENT GENERATORS ---

  private startAmbientGenerators(): void {
    if (!this.ctx || !this.ambientGain) return;

    // 1. Wind ambience
    const bufferSize = this.ctx.sampleRate * 2;
    const windBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = windBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 250;

    this.windGainNode = this.ctx.createGain();
    this.windGainNode.gain.value = 0.15;

    windSource.connect(windFilter);
    windFilter.connect(this.windGainNode);
    this.windGainNode.connect(this.ambientGain);

    windSource.start();

    setInterval(() => {
      if (this.ctx && windFilter) {
        const targetFreq = 180 + Math.random() * 220;
        windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 2);
      }
    }, 4000);

    // 2. Rain generator
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const rainData = rainBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      rainData[i] = Math.random() * 2 - 1;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1200;
    rainFilter.Q.value = 1.0;

    this.rainGainNode = this.ctx.createGain();
    this.rainGainNode.gain.value = 0.0;

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGainNode);
    this.rainGainNode.connect(this.ambientGain);

    rainSource.start();

    // 3. Periodic Crickets Chirp
    window.setInterval(() => {
      if (Math.random() < 0.6 && this.currentZoneSound !== 'rain') {
        this.playCricketChirp();
      }
    }, 3500);

    // 4. Periodic Campfire Crackle
    window.setInterval(() => {
      if (this.currentZoneSound === 'station' || this.currentZoneSound === 'forest') {
        this.playCrackleSound();
      }
    }, 800);
  }

  public setZoneAmbient(zoneSound: 'forest' | 'rain' | 'stream' | 'wind' | 'station'): void {
    this.currentZoneSound = zoneSound;
    if (!this.ctx || !this.rainGainNode || !this.windGainNode) return;

    const now = this.ctx.currentTime;
    if (zoneSound === 'rain') {
      this.rainGainNode.gain.setTargetAtTime(0.25, now, 1.5);
      this.windGainNode.gain.setTargetAtTime(0.2, now, 1.5);
    } else if (zoneSound === 'wind') {
      this.rainGainNode.gain.setTargetAtTime(0.02, now, 1.5);
      this.windGainNode.gain.setTargetAtTime(0.35, now, 1.5);
    } else {
      this.rainGainNode.gain.setTargetAtTime(0.03, now, 1.5);
      this.windGainNode.gain.setTargetAtTime(0.12, now, 1.5);
    }
  }

  // --- BACKGROUND MINIMAL PIANO MUSIC ---

  private startBackgroundMusicLoop(): void {
    const chords = [
      [261.63, 329.63, 392.00, 493.88],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 220.00, 261.63, 329.63],
      [196.00, 246.94, 293.66, 349.23],
    ];

    let chordIndex = 0;

    window.setInterval(() => {
      if (this.ctx && this.musicGain && Math.random() > 0.15) {
        const chord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        chord.forEach((freq, idx) => {
          setTimeout(() => {
            this.playSoftPianoNote(freq, 2.5 + Math.random());
          }, idx * 350 + Math.random() * 100);
        });
      }
    }, 9000);
  }

  private playSoftPianoNote(freq: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playFootstep(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110 + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.value = 200;

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playFireflyCollect(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const baseNote = notes[Math.floor(Math.random() * notes.length)];

    [baseNote, baseNote * 1.25].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.001, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    });
  }

  public playPageFlip(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
  }

  public playCassetteClick(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playStoneSkip(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playCatPurr(): void {
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playCricketChirp(): void {
    if (!this.ctx || !this.ambientGain) return;

    const now = this.ctx.currentTime;
    const freq = 4500 + Math.random() * 500;

    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0.02, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.025);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.025);
    }
  }

  private playCrackleSound(): void {
    if (!this.ctx || !this.ambientGain || Math.random() > 0.4) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }
}

export const SoundEngine = new SoundEngineManager();
