import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { ProceduralArt } from '../game/proceduralArt';
import type { RenderableObject } from '../types/game';

interface GameCanvasProps {
  engine: GameEngine;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const onKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyDown(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      engine.update(w, h);

      ctx.clearRect(0, 0, w, h);

      // --- CINEMATIC PERSPECTIVE SHIFT MODE ---
      if (engine.perspectiveMode === 'cinematic_side') {
        const type = engine.activeCinematicType;
        if (type === 'whisper_tree') {
          ProceduralArt.drawSideViewWhisperTree(ctx, w, h);
        } else {
          ProceduralArt.drawSideViewBench(ctx, w, h);
        }
        animFrameId = requestAnimationFrame(render);
        return;
      }

      // --- TOP-DOWN OPEN WORLD MODE (6000px × 6000px) ---
      ctx.save();

      const cam = engine.camera;
      ctx.translate(w / 2, h / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x - w / 2, -cam.y - h / 2);

      // Ground Landscape
      const groundGrad = ctx.createLinearGradient(0, 0, 6000, 6000);
      groundGrad.addColorStop(0, '#0c1a12');
      groundGrad.addColorStop(0.5, '#12261a');
      groundGrad.addColorStop(1, '#09150d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, 6000, 6000);

      // Cobblestone Pathways connecting Biomes
      ctx.strokeStyle = '#1f2e22';
      ctx.lineWidth = 45;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(3000, 3000); // Center Glade
      ctx.lineTo(1400, 3000); // West to Meadow
      ctx.lineTo(1400, 1200); // North to Rain Canopy
      ctx.lineTo(3000, 1100); // East to Whisper Tree
      ctx.lineTo(4500, 1400); // East to Lake
      ctx.lineTo(4400, 3100); // South to Coffee Corner
      ctx.lineTo(4500, 4600); // South to Memory Hollow
      ctx.lineTo(1500, 5100); // West to Train Station
      ctx.stroke();

      // Firefly Lake Water Body
      const lakeGrad = ctx.createRadialGradient(4700, 1400, 80, 4700, 1400, 600);
      lakeGrad.addColorStop(0, '#0c4a6e');
      lakeGrad.addColorStop(0.7, '#0369a1');
      lakeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lakeGrad;
      ctx.beginPath();
      ctx.arc(4700, 1400, 600, 0, Math.PI * 2);
      ctx.fill();

      // Water Starlight Ripples
      const time = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let r = 1; r <= 3; r++) {
        const rippleR = ((time * 30 + r * 120) % 500);
        ctx.beginPath();
        ctx.arc(4700, 1400, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Collect Y-Sorted Objects for Depth Rendering
      const renderables: RenderableObject[] = [];

      // Active Guided Story Beacon Marker
      const activeWp = engine.getActiveStoryWaypoint();
      if (activeWp) {
        renderables.push({
          y: activeWp.y,
          draw: (c) => {
            const pulseR = 35 + Math.sin(time * 3) * 12;
            const beaconGrad = c.createRadialGradient(activeWp.x, activeWp.y, 2, activeWp.x, activeWp.y, pulseR * 2.5);
            beaconGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
            beaconGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
            beaconGrad.addColorStop(1, 'transparent');
            c.fillStyle = beaconGrad;
            c.beginPath();
            c.arc(activeWp.x, activeWp.y, pulseR * 2.5, 0, Math.PI * 2);
            c.fill();

            // Story Marker Star
            c.fillStyle = '#fef08a';
            c.beginPath();
            c.arc(activeWp.x, activeWp.y - Math.sin(time * 4) * 8, 9, 0, Math.PI * 2);
            c.fill();
          },
        });
      }

      // Trees scattered across 6000x6000px
      for (let tx = 150; tx < 5900; tx += 320) {
        for (let ty = 150; ty < 5900; ty += 320) {
          if (Math.hypot(tx - 4700, ty - 1400) < 620) continue;
          if (Math.hypot(tx - 3000, ty - 3000) < 220) continue;

          if (tx >= cam.x - 200 && tx <= cam.x + w + 200 && ty >= cam.y - 200 && ty <= cam.y + h + 200) {
            const type = (tx + ty) % 3 === 0 ? 'pine' : (tx + ty) % 2 === 0 ? 'oak' : 'birch';
            renderables.push({
              y: ty,
              draw: (c) => ProceduralArt.drawTopDownTree(c, tx, ty, 65, type, engine.windForce),
            });
          }
        }
      }

      // Landmarks
      renderables.push({
        y: 1200,
        draw: (c) => {
          ProceduralArt.drawTopDownBench(c, 1400, 1200);
          ProceduralArt.drawTopDownLantern(c, 1340, 1200, true);
        },
      });

      renderables.push({
        y: 3100,
        draw: (c) => {
          ProceduralArt.drawTopDownCoffeeStand(c, 4400, 3100);
          ProceduralArt.drawTopDownLantern(c, 4320, 3100, true);
        },
      });

      renderables.push({
        y: 1100,
        draw: (c) => ProceduralArt.drawTopDownWhisperTree(c, 3000, 1100),
      });

      renderables.push({
        y: 5100,
        draw: (c) => ProceduralArt.drawTopDownTrainStation(c, 1500, 5100),
      });

      // Letters
      engine.letters.forEach((l) => {
        if (!l.unlocked && l.x >= cam.x - 100 && l.x <= cam.x + w + 100 && l.y >= cam.y - 100 && l.y <= cam.y + h + 100) {
          renderables.push({
            y: l.y,
            draw: (c) => {
              c.fillStyle = '#fef08a';
              c.beginPath();
              c.arc(l.x, l.y, 7, 0, Math.PI * 2);
              c.fill();
            },
          });
        }
      });

      // Tapes
      engine.tapes.forEach((t) => {
        if (!t.unlocked && t.x >= cam.x - 100 && t.x <= cam.x + w + 100 && t.y >= cam.y - 100 && t.y <= cam.y + h + 100) {
          renderables.push({
            y: t.y,
            draw: (c) => {
              c.fillStyle = '#38bdf8';
              c.fillRect(t.x - 7, t.y - 5, 14, 10);
            },
          });
        }
      });

      // Coffee Beans
      engine.beans.forEach((b) => {
        if (!b.collected && b.x >= cam.x - 100 && b.x <= cam.x + w + 100 && b.y >= cam.y - 100 && b.y <= cam.y + h + 100) {
          renderables.push({
            y: b.y,
            draw: (c) => {
              c.fillStyle = '#78350f';
              c.beginPath();
              c.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
              c.fill();
            },
          });
        }
      });

      // Player Character
      renderables.push({
        y: engine.player.y,
        draw: (c) => {
          ProceduralArt.drawTopDownPlayer(
            c,
            engine.player.x,
            engine.player.y,
            engine.player.facing,
            engine.player.isWalking,
            engine.player.isSitting,
            engine.player.animFrame
          );
        },
      });

      // Sort by Y ascending & draw depth layers
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((r) => r.draw(ctx));

      // Overlay Fireflies
      engine.fireflies.forEach((f) => {
        if (f.x >= cam.x - 100 && f.x <= cam.x + w + 100 && f.y >= cam.y - 100 && f.y <= cam.y + h + 100) {
          const pulse = 0.7 + Math.sin(time * 4 + f.pulsePhase) * 0.3;
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * pulse, 0, Math.PI * 2);
          ctx.fill();

          const fireflyBloom = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius * 6 * pulse);
          fireflyBloom.addColorStop(0, f.color);
          fireflyBloom.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = fireflyBloom;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 6 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Rain Particles at Rain Canopy
      if (engine.currentZone === 'rain_bench') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.lineWidth = 1.2;
        engine.rainDrops.forEach((r) => {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + 2, r.y + r.length);
          ctx.stroke();
        });
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [engine]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const cam = engine.camera;

    const worldX = (clickX - w / 2) / cam.zoom + cam.x + w / 2;
    const worldY = (clickY - h / 2) / cam.zoom + cam.y + h / 2;

    engine.handleCanvasClick(worldX, worldY);
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handleCanvasPointerDown}
      className="game-canvas"
    />
  );
};
