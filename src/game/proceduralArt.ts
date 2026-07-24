// Procedural Graphics Generator with Top-Down and Cinematic Side-View Illustration Modes

import type { FacingDirection } from '../types/game';
import { getCachedSvgImage } from '../utils/AssetManager';

export class ProceduralArt {
  // --- 1. TOP-DOWN OPEN WORLD GRAPHICS ---

  public static drawTopDownTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    type: 'pine' | 'oak' | 'birch',
    wind: number = 0.2
  ): void {
    ctx.save();
    ctx.translate(x, y);

    const swayX = Math.sin(Date.now() * 0.0015 + x * 0.01) * wind * 6;
    const swayY = Math.cos(Date.now() * 0.0015 + y * 0.01) * wind * 4;

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, radius * 0.95, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk base
    ctx.fillStyle = type === 'birch' ? '#d9d2c5' : '#261c16';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'pine') {
      const tiers = [
        { r: radius, color: '#10291c' },
        { r: radius * 0.75, color: '#183827' },
        { r: radius * 0.5, color: '#224a35' },
        { r: radius * 0.25, color: '#2d5e44' },
      ];

      tiers.forEach((tier, idx) => {
        const offX = swayX * (0.2 + idx * 0.25);
        const offY = swayY * (0.2 + idx * 0.25);
        ctx.fillStyle = tier.color;
        ctx.beginPath();
        ctx.arc(offX, offY - idx * 4, tier.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (type === 'oak') {
      const clusters = [
        { cx: 0, cy: 0, r: radius, color: '#153120' },
        { cx: -radius * 0.3, cy: -radius * 0.2, r: radius * 0.65, color: '#1b3b28' },
        { cx: radius * 0.3, cy: -radius * 0.2, r: radius * 0.65, color: '#234731' },
        { cx: 0, cy: -radius * 0.3, r: radius * 0.55, color: '#2d5e42' },
      ];

      clusters.forEach((c) => {
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.cx + swayX, c.cy + swayY, c.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.fillStyle = '#1e3a27';
      ctx.beginPath();
      ctx.arc(swayX, swayY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d573c';
      ctx.beginPath();
      ctx.arc(swayX - 5, swayY - 5, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public static drawTopDownPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: FacingDirection,
    isWalking: boolean,
    isSitting: boolean,
    animFrame: number,
    cloakStyle: 'violet' | 'emerald' | 'azure' | 'amber' | 'rose' = 'violet',
    lanternGlow: 'amber' | 'gold' | 'cyan' | 'emerald' | 'violet' = 'amber'
  ): void {
    ctx.save();
    ctx.translate(x, y);

    const glowPalette = {
      amber: { inner: 'rgba(251, 146, 60, 0.85)', mid: 'rgba(251, 146, 60, 0.3)', core: '#fb923c' },
      gold: { inner: 'rgba(254, 240, 138, 0.85)', mid: 'rgba(254, 240, 138, 0.3)', core: '#fef08a' },
      cyan: { inner: 'rgba(56, 189, 248, 0.85)', mid: 'rgba(56, 189, 248, 0.3)', core: '#38bdf8' },
      emerald: { inner: 'rgba(52, 211, 153, 0.85)', mid: 'rgba(52, 211, 153, 0.3)', core: '#34d399' },
      violet: { inner: 'rgba(192, 132, 252, 0.85)', mid: 'rgba(192, 132, 252, 0.3)', core: '#c084fc' },
    }[lanternGlow] || { inner: 'rgba(251, 146, 60, 0.85)', mid: 'rgba(251, 146, 60, 0.3)', core: '#fb923c' };

    const svgSprite = getCachedSvgImage('forestSpiritTopDown');
    if (svgSprite) {
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lantern glow bloom
      const flicker = Math.sin(Date.now() * 0.01 + x * 0.05) * 3;
      const lX = (facing === 'left' || facing === 'up_left' || facing === 'down_left') ? -14 : 14;
      const lY = (facing === 'up' || facing === 'up_left' || facing === 'up_right') ? -16 : -2;
      const bloom = ctx.createRadialGradient(lX, lY, 1, lX, lY, 28 + flicker);
      bloom.addColorStop(0, glowPalette.inner);
      bloom.addColorStop(0.5, glowPalette.mid);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(lX, lY, 28 + flicker, 0, Math.PI * 2);
      ctx.fill();

      const bob = isWalking ? Math.sin(Date.now() * 0.015) * 2 : 0;
      ctx.drawImage(svgSprite, -20, -28 + bob, 40, 48);

      ctx.restore();
      return;
    }

    const cloakColors = {
      violet: { base: '#312e81', hood: '#c084fc', inner: '#1e1b4b' },
      emerald: { base: '#064e3b', hood: '#34d399', inner: '#022c22' },
      azure: { base: '#0c4a6e', hood: '#38bdf8', inner: '#082f49' },
      amber: { base: '#78350f', hood: '#fbbf24', inner: '#451a03' },
      rose: { base: '#831843', hood: '#f472b6', inner: '#500724' },
    }[cloakStyle] || { base: '#312e81', hood: '#c084fc', inner: '#1e1b4b' };

    const glowColors = {
      amber: { inner: 'rgba(251, 146, 60, 0.85)', mid: 'rgba(251, 146, 60, 0.3)', core: '#fb923c' },
      gold: { inner: 'rgba(254, 240, 138, 0.85)', mid: 'rgba(254, 240, 138, 0.3)', core: '#fef08a' },
      cyan: { inner: 'rgba(56, 189, 248, 0.85)', mid: 'rgba(56, 189, 248, 0.3)', core: '#38bdf8' },
      emerald: { inner: 'rgba(52, 211, 153, 0.85)', mid: 'rgba(52, 211, 153, 0.3)', core: '#34d399' },
      violet: { inner: 'rgba(192, 132, 252, 0.85)', mid: 'rgba(192, 132, 252, 0.3)', core: '#c084fc' },
    }[lanternGlow] || { inner: 'rgba(251, 146, 60, 0.85)', mid: 'rgba(251, 146, 60, 0.3)', core: '#fb923c' };

    const bob = isWalking ? Math.sin(animFrame * 0.4) * 2.5 : 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isSitting) {
      ctx.fillStyle = cloakColors.base;
      ctx.beginPath();
      ctx.arc(0, -6, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cloakColors.hood;
      ctx.beginPath();
      ctx.arc(0, -10, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cloakColors.inner;
      ctx.beginPath();
      ctx.arc(0, -12, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = glowColors.core;
      ctx.beginPath();
      ctx.arc(14, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (isWalking) {
        const legOff = Math.sin(animFrame * 0.4) * 5;
        ctx.fillStyle = cloakColors.inner;
        ctx.beginPath();
        ctx.arc(-5, 4 + legOff, 3.5, 0, Math.PI * 2);
        ctx.arc(5, 4 - legOff, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = cloakColors.base;
      ctx.beginPath();
      ctx.arc(0, -6 + bob, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cloakColors.hood;
      ctx.beginPath();
      ctx.arc(0, -10 + bob, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cloakColors.inner;
      ctx.beginPath();
      ctx.arc(0, -13 + bob, 7.5, 0, Math.PI * 2);
      ctx.fill();

      let lX = 12;
      let lY = -2;
      if (facing === 'left' || facing === 'up_left' || facing === 'down_left') lX = -12;
      if (facing === 'up' || facing === 'up_left' || facing === 'up_right') lY = -14;

      const bloom = ctx.createRadialGradient(lX, lY + bob, 1, lX, lY + bob, 26);
      bloom.addColorStop(0, glowColors.inner);
      bloom.addColorStop(0.5, glowColors.mid);
      bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(lX, lY + bob, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = glowColors.core;
      ctx.beginPath();
      ctx.arc(lX, lY + bob, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public static drawTopDownBench(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('rainShelterBench');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(svgImg, -60, -50, 120, 100);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-28, -6, 56, 16);

    ctx.fillStyle = '#543325';
    ctx.fillRect(-30, -10, 60, 16);

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-32, -12, 4, 20);
    ctx.fillRect(28, -12, 4, 20);

    ctx.restore();
  }

  public static drawTopDownLantern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isLit: boolean = true
  ): void {
    const svgImg = getCachedSvgImage('fireflyLantern');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      if (isLit) {
        const flicker = Math.sin(Date.now() * 0.01 + x * 0.05) * 3;
        const bloom = ctx.createRadialGradient(0, 0, 2, 0, 0, 48 + flicker);
        bloom.addColorStop(0, 'rgba(251, 146, 60, 0.85)');
        bloom.addColorStop(0.4, 'rgba(251, 146, 60, 0.25)');
        bloom.addColorStop(1, 'rgba(251, 146, 60, 0)');

        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(0, 0, 48 + flicker, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.drawImage(svgImg, -16, -16, 32, 32);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    if (isLit) {
      const flicker = Math.sin(Date.now() * 0.01 + x * 0.05) * 3;
      const bloom = ctx.createRadialGradient(0, 0, 2, 0, 0, 48 + flicker);
      bloom.addColorStop(0, 'rgba(251, 146, 60, 0.85)');
      bloom.addColorStop(0.4, 'rgba(251, 146, 60, 0.25)');
      bloom.addColorStop(1, 'rgba(251, 146, 60, 0)');

      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + flicker, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isLit ? '#fed7aa' : '#78716c';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public static drawTopDownCoffeeStand(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('coffeeKiosk');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(svgImg, -60, -50, 120, 100);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    const width = 80;
    const height = 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-width / 2, -height / 2 + 8, width, height);

    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.fillStyle = '#fef3c7';
    for (let c = -width / 2; c < width / 2; c += 16) {
      ctx.fillRect(c, -height / 2, 8, height);
    }

    ctx.fillStyle = '#3a2518';
    ctx.fillRect(-width / 2, height / 2 - 8, width, 8);

    ctx.restore();
  }

  public static drawTopDownWhisperTree(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('whisperTree');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);

      const time = Date.now() * 0.001;
      const auraPulse = Math.sin(time * 1.5) * 20;
      const canopyGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 240 + auraPulse);
      canopyGlow.addColorStop(0, 'rgba(167, 139, 250, 0.7)');
      canopyGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
      canopyGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = canopyGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 240 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(svgImg, -180, -180, 360, 360);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    const time = Date.now() * 0.001;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 20, 180, 0, Math.PI * 2);
    ctx.fill();

    const auraPulse = Math.sin(time * 1.5) * 20;
    const canopyGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 240 + auraPulse);
    canopyGlow.addColorStop(0, 'rgba(167, 139, 250, 0.7)');
    canopyGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
    canopyGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.fillStyle = canopyGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 240 + auraPulse, 0, Math.PI * 2);
    ctx.fill();

    const foliage = [
      { cx: 0, cy: 0, r: 140, color: '#2e1065' },
      { cx: -60, cy: -50, r: 100, color: '#3b0764' },
      { cx: 60, cy: -50, r: 100, color: '#4c1d95' },
      { cx: -50, cy: 50, r: 90, color: '#581c87' },
      { cx: 50, cy: 50, r: 90, color: '#3b0764' },
    ];

    foliage.forEach((f) => {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.cx, f.cy, f.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  public static drawTopDownTrainStation(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('stationCampfire');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);

      const time = Date.now() * 0.005;
      const fireGlow = ctx.createRadialGradient(0, 20, 4, 0, 20, 70 + Math.sin(time * 3) * 10);
      fireGlow.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
      fireGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
      fireGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.arc(0, 20, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(svgImg, -110, -70, 220, 140);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#292524';
    ctx.fillRect(-120, -70, 240, 140);
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 3;
    ctx.strokeRect(-120, -70, 240, 140);

    ctx.fillStyle = 'rgba(28, 25, 23, 0.85)';
    ctx.fillRect(-110, -60, 220, 40);

    const time = Date.now() * 0.005;

    const fireGlow = ctx.createRadialGradient(0, 20, 4, 0, 20, 60 + Math.sin(time * 3) * 8);
    fireGlow.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
    fireGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
    fireGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(0, 20, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.fillRect(-12, 18, 24, 4);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 20, 8 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 20, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public static drawTopDownArcade(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('retroArcadeMachine');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(svgImg, -40, -60, 80, 120);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    // Cabinet Base
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-20, -30, 40, 60);

    // Glowing Neon Screen
    const time = Date.now() * 0.003;
    ctx.fillStyle = `rgba(168, 85, 247, ${0.7 + Math.sin(time) * 0.2})`;
    ctx.fillRect(-14, -24, 28, 20);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(-10, -20, 8, 8);

    // Coin Slot
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4, 10, 8, 4);

    ctx.restore();
  }

  public static drawTopDownBridge(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('waterfallBridge');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(svgImg, -80, -40, 160, 80);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    // Wooden Bridge Deck
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-60, -25, 120, 50);

    // Planks
    ctx.fillStyle = '#451a03';
    for (let px = -55; px < 55; px += 12) {
      ctx.fillRect(px, -25, 2, 50);
    }

    // Railings
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-60, -28, 120, 6);
    ctx.fillRect(-60, 22, 120, 6);

    ctx.restore();
  }

  public static drawTopDownObservatory(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const svgImg = getCachedSvgImage('observatoryTower');
    if (svgImg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.drawImage(svgImg, -70, -70, 140, 140);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    // Stone Tower Base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();

    // Dome Roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    // Brass Telescope
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -25);
    ctx.stroke();

    ctx.restore();
  }

  // --- 2. CINEMATIC SIDE-VIEW PERSPECTIVE ILLUSTRATION MODES ---

  public static drawSideViewBench(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0b132b');
    sky.addColorStop(1, '#1c2541');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const groundY = h * 0.72;

    // Distant Evergreen Pines
    for (let x = 50; x < w; x += 140) {
      this.drawSideViewPineTree(ctx, x, groundY, 260);
    }

    // Wooden Bench
    const benchX = w / 2;
    ctx.fillStyle = '#44281d';
    ctx.fillRect(benchX - 80, groundY - 30, 160, 12);
    ctx.fillRect(benchX - 80, groundY - 60, 160, 10);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(benchX - 70, groundY - 60, 8, 42);
    ctx.fillRect(benchX + 62, groundY - 60, 8, 42);

    // Traveler sitting peacefully
    ctx.fillStyle = '#312e81';
    ctx.fillRect(benchX - 15, groundY - 55, 30, 30);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(benchX - 12, groundY - 62, 24, 8);
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(benchX, groundY - 74, 12, 0, Math.PI * 2);
    ctx.fill();

    // Lantern Glow beside Bench
    const flicker = Math.sin(Date.now() * 0.01) * 4;
    const bloom = ctx.createRadialGradient(benchX + 100, groundY - 10, 2, benchX + 100, groundY - 10, 80 + flicker);
    bloom.addColorStop(0, 'rgba(251, 146, 60, 0.85)');
    bloom.addColorStop(1, 'transparent');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(benchX + 100, groundY - 10, 80 + flicker, 0, Math.PI * 2);
    ctx.fill();

    // Falling Raindrops
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.5;
    const time = Date.now() * 0.003;
    for (let r = 0; r < 60; r++) {
      const rx = (r * 35 + time * 100) % w;
      const ry = (r * 25 + time * 300) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 3, ry + 16);
      ctx.stroke();
    }

    ctx.restore();
  }

  public static drawSideViewWhisperTree(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1e1b4b');
    sky.addColorStop(1, '#0f172a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const time = Date.now() * 0.001;
    const treeX = w / 2;
    const groundY = h * 0.85;

    // Giant Glowing Canopy Aura
    const aura = ctx.createRadialGradient(treeX, h * 0.35, 40, treeX, h * 0.35, 320);
    aura.addColorStop(0, 'rgba(167, 139, 250, 0.75)');
    aura.addColorStop(0.6, 'rgba(139, 92, 246, 0.25)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(treeX, h * 0.35, 320, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#1a1412';
    ctx.beginPath();
    ctx.moveTo(treeX - 60, groundY);
    ctx.quadraticCurveTo(treeX, h * 0.45, treeX + 60, groundY);
    ctx.fill();

    // Floating luminescent notes
    for (let p = 0; p < 15; p++) {
      const px = treeX + Math.sin(time + p) * 180;
      const py = h * 0.35 + Math.cos(time * 0.8 + p * 2) * 140;
      ctx.fillStyle = '#ddd6fe';
      ctx.beginPath();
      ctx.arc(px, py, 3 + (p % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private static drawSideViewPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, height: number): void {
    ctx.fillStyle = '#1e2d24';
    ctx.fillRect(x - 5, y - height * 0.3, 10, height * 0.3);

    for (let i = 0; i < 4; i++) {
      const progress = i / 4;
      const tierY = y - height * (0.3 + progress * 0.65);
      const tierW = height * 0.35 * (1 - progress * 0.6);
      ctx.fillStyle = i % 2 === 0 ? '#183827' : '#10291c';
      ctx.beginPath();
      ctx.moveTo(x - tierW, tierY + 20);
      ctx.lineTo(x, tierY - 30);
      ctx.lineTo(x + tierW, tierY + 20);
      ctx.closePath();
      ctx.fill();
    }
  }
}
