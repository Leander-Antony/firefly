import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { ProceduralArt } from '../game/proceduralArt';
import { getCachedSvgImage } from '../utils/AssetManager';
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
        } else if (type === 'campfire' || type === 'cat') {
          ProceduralArt.drawSideViewCampfire(ctx, w, h);
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

      // Ground Landscape (10,000px × 10,000px)
      const groundGrad = ctx.createLinearGradient(0, 0, 10000, 10000);
      groundGrad.addColorStop(0, '#0c1a12');
      groundGrad.addColorStop(0.5, '#12261a');
      groundGrad.addColorStop(1, '#09150d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, 10000, 10000);

      // Cobblestone Pathways connecting Biomes
      // Dirt Trail Network across 10,000px × 10,000px Map
      ctx.strokeStyle = '#1f2e22';
      ctx.lineWidth = 55;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(5000, 5000); // Central Glade
      ctx.lineTo(2000, 1500); // Arcade Ruins
      ctx.lineTo(2000, 2800); // Rain Bench
      ctx.lineTo(2000, 4800); // Meadow
      ctx.lineTo(5000, 2000); // Whisper Tree
      ctx.lineTo(8000, 1500); // Starlight Bridge
      ctx.lineTo(8000, 3500); // Firefly Lake
      ctx.lineTo(8000, 4800); // Coffee Corner
      ctx.lineTo(8000, 7800); // Memory Hollow
      ctx.lineTo(5000, 8500); // Observatory
      ctx.lineTo(2000, 8200); // Cauliflower Ridge
      ctx.lineTo(2000, 9200); // Train Station
      ctx.stroke();

      // Firefly Lake Water Body (East - 8000, 3500)
      const lakeGrad = ctx.createRadialGradient(8000, 3500, 100, 8000, 3500, 850);
      lakeGrad.addColorStop(0, '#0c4a6e');
      lakeGrad.addColorStop(0.7, '#0369a1');
      lakeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lakeGrad;
      ctx.beginPath();
      ctx.arc(8000, 3500, 850, 0, Math.PI * 2);
      ctx.fill();

      // Water Starlight Ripples
      const time = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let r = 1; r <= 3; r++) {
        const rippleR = ((time * 30 + r * 120) % 700);
        ctx.beginPath();
        ctx.arc(8000, 3500, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Waterfall Pool (Northeast - 8000, 1500)
      const wfGrad = ctx.createRadialGradient(8000, 1500, 50, 8000, 1500, 600);
      wfGrad.addColorStop(0, '#38bdf8');
      wfGrad.addColorStop(0.8, '#0284c7');
      wfGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = wfGrad;
      ctx.beginPath();
      ctx.arc(8000, 1500, 600, 0, Math.PI * 2);
      ctx.fill();

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

      // Trees scattered across 10,000px × 10,000px
      for (let tx = 200; tx < 9800; tx += 340) {
        for (let ty = 200; ty < 9800; ty += 340) {
          if (Math.hypot(tx - 8000, ty - 3500) < 880) continue; // Lake
          if (Math.hypot(tx - 8000, ty - 1500) < 620) continue; // Waterfall
          if (Math.hypot(tx - 5000, ty - 5000) < 260) continue; // Central Glade
          if (Math.hypot(tx - 5000, ty - 2000) < 320) continue; // Whisper Tree
          if (Math.hypot(tx - 2000, ty - 1500) < 280) continue; // Arcade

          if (tx >= cam.x - 200 && tx <= cam.x + w + 200 && ty >= cam.y - 200 && ty <= cam.y + h + 200) {
            const type = (tx + ty) % 3 === 0 ? 'pine' : (tx + ty) % 2 === 0 ? 'oak' : 'birch';
            renderables.push({
              y: ty,
              draw: (c) => ProceduralArt.drawTopDownTree(c, tx, ty, 65, type, engine.windForce),
            });
          }
        }
      }

      // Landmarks (Drawn at EXACT interactive coordinates matching INTERACTIVE_POINTS)
      renderables.push({
        y: 2800,
        draw: (c) => {
          ProceduralArt.drawTopDownBench(c, 2000, 2800);
          ProceduralArt.drawTopDownLantern(c, 1940, 2800, true);
        },
      });

      // Directive 4: World Transformations when Memories are collected
      if (engine.hasCoffeeMemory()) {
        renderables.push({
          y: 4850,
          draw: (c) => {
            const fireGlow = c.createRadialGradient(8060, 4820, 2, 8060, 4820, 35);
            fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.9)');
            fireGlow.addColorStop(1, 'transparent');
            c.fillStyle = fireGlow;
            c.beginPath();
            c.arc(8060, 4820, 35, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#f97316';
            c.beginPath();
            c.arc(8060, 4820, 6, 0, Math.PI * 2);
            c.fill();
          },
        });
      }

      if (engine.hasFootballMemory()) {
        renderables.push({
          y: 7820,
          draw: (c) => {
            c.fillStyle = '#7c2d12';
            c.beginPath();
            c.ellipse(8040, 7820, 10, 6, 0.4, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = '#fef08a';
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(8036, 7820);
            c.lineTo(8044, 7820);
            c.stroke();
          },
        });
      }

      if (engine.hasNotebookMemory()) {
        renderables.push({
          y: 5020,
          draw: (c) => {
            const pTime = Date.now() * 0.001;
            for (let i = 0; i < 4; i++) {
              const px = 5000 + Math.cos(pTime * 0.8 + i * 1.5) * 60;
              const py = 5000 + Math.sin(pTime * 0.8 + i * 1.5) * 40 - i * 10;
              c.fillStyle = 'rgba(254, 243, 199, 0.85)';
              c.fillRect(px, py, 7, 10);
            }
          },
        });
      }

      if (engine.hasChocolateMemory()) {
        renderables.push({
          y: 8520,
          draw: (c) => {
            c.fillStyle = '#b45309';
            c.beginPath();
            c.arc(5060, 8520, 7, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#451a03';
            c.fillRect(5062, 8522, 4, 4);
          },
        });
      }

      if (engine.hasCauliflowerMemory()) {
        renderables.push({
          y: 8210,
          draw: (c) => {
            c.fillStyle = '#fde047';
            for (let f = 0; f < 6; f++) {
              const fx = 2030 + Math.sin(f * 2) * 25;
              const fy = 8210 + Math.cos(f * 2) * 25;
              c.beginPath();
              c.arc(fx, fy, 4, 0, Math.PI * 2);
              c.fill();
            }
          },
        });
      }

      renderables.push({
        y: 1500,
        draw: (c) => {
          ProceduralArt.drawTopDownArcade(c, 2000, 1500);
          ProceduralArt.drawTopDownLantern(c, 1940, 1500, true);
        },
      });

      renderables.push({
        y: 4800,
        draw: (c) => {
          ProceduralArt.drawTopDownCoffeeStand(c, 8000, 4800);
          ProceduralArt.drawTopDownLantern(c, 7920, 4800, true);
        },
      });

      renderables.push({
        y: 2000,
        draw: (c) => ProceduralArt.drawTopDownWhisperTree(c, 5000, 2000),
      });

      renderables.push({
        y: 1500,
        draw: (c) => ProceduralArt.drawTopDownBridge(c, 8000, 1500),
      });

      renderables.push({
        y: 8200,
        draw: (c) => {
          ProceduralArt.drawTopDownBench(c, 2000, 8200);
          ProceduralArt.drawTopDownLantern(c, 1940, 8200, true);
        },
      });

      renderables.push({
        y: 8500,
        draw: (c) => ProceduralArt.drawTopDownObservatory(c, 5000, 8500),
      });

      renderables.push({
        y: 9200,
        draw: (c) => ProceduralArt.drawTopDownTrainStation(c, 2000, 9200),
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
              // Cyan aura glow under cassette
              const tapeGlow = c.createRadialGradient(t.x, t.y, 2, t.x, t.y, 22);
              tapeGlow.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
              tapeGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
              tapeGlow.addColorStop(1, 'transparent');
              c.fillStyle = tapeGlow;
              c.beginPath();
              c.arc(t.x, t.y, 22, 0, Math.PI * 2);
              c.fill();

              const cassetteImg = getCachedSvgImage('cassette');
              if (cassetteImg) {
                c.drawImage(cassetteImg, t.x - 16, t.y - 12, 32, 24);
              } else {
                c.fillStyle = '#38bdf8';
                c.fillRect(t.x - 10, t.y - 7, 20, 14);
              }
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

      // Easter Eggs
      engine.easterEggs.forEach((e) => {
        if (!e.found && e.x >= cam.x - 100 && e.x <= cam.x + w + 100 && e.y >= cam.y - 100 && e.y <= cam.y + h + 100) {
          renderables.push({
            y: e.y,
            draw: (c) => {
              const pulse = 0.5 + Math.abs(Math.sin(time * 3)) * 0.5;
              
              const eggGlow = c.createRadialGradient(e.x, e.y, 2, e.x, e.y, 22);
              eggGlow.addColorStop(0, `rgba(251, 191, 36, ${0.8 * pulse})`);
              eggGlow.addColorStop(1, 'transparent');
              c.fillStyle = eggGlow;
              c.beginPath();
              c.arc(e.x, e.y, 22, 0, Math.PI * 2);
              c.fill();

              if (e.id === 'egg_6') {
                const tokenImg = getCachedSvgImage('arcadeToken');
                if (tokenImg) {
                  c.drawImage(tokenImg, e.x - 12, e.y - 12, 24, 24);
                } else {
                  c.fillStyle = '#fbbf24';
                  c.beginPath();
                  c.arc(e.x, e.y, 6, 0, Math.PI * 2);
                  c.fill();
                }
              } else {
                c.fillStyle = '#fbbf24';
                c.beginPath();
                c.arc(e.x, e.y, 4, 0, Math.PI * 2);
                c.fill();
              }
            },
          });
        }
      });

      // Player Character
      renderables.push({
        y: engine.player.y,
        draw: (c) => {
          if (engine.savedState.hasReachedEnding) {
            const auraTime = Date.now() * 0.002;
            const auraR = 36 + Math.sin(auraTime) * 6;
            const auraGrad = c.createRadialGradient(engine.player.x, engine.player.y, 2, engine.player.x, engine.player.y, auraR);
            auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
            auraGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.25)');
            auraGrad.addColorStop(1, 'transparent');
            c.fillStyle = auraGrad;
            c.beginPath();
            c.arc(engine.player.x, engine.player.y, auraR, 0, Math.PI * 2);
            c.fill();
          }

          ProceduralArt.drawTopDownPlayer(
            c,
            engine.player.x,
            engine.player.y,
            engine.player.facing,
            engine.player.isWalking,
            engine.player.isSitting,
            engine.player.animFrame,
            engine.savedState.settings.cloakStyle,
            engine.savedState.settings.lanternGlow
          );
        },
      });

      // Sort by Y ascending & draw depth layers
      renderables.sort((a, b) => a.y - b.y);
      renderables.forEach((r) => r.draw(ctx));

      // Forest Spirit Animation
      if (engine.isForestSpiritActive) {
        const fsImg = getCachedSvgImage('forestSpirit');
        if (fsImg) {
          const elapsed = Date.now() - engine.forestSpiritTime;
          const progress = Math.min(1, elapsed / 2000);
          
          // Eases out, floats up, fades out at end
          const floatY = (1 - Math.pow(1 - progress, 3)) * -120; 
          const hoverY = Math.sin(elapsed * 0.01) * 5;
          const opacity = progress > 0.8 ? (1 - (progress - 0.8) * 5) : (progress < 0.2 ? progress * 5 : 1);
          
          ctx.save();
          ctx.globalAlpha = opacity;
          
          // Add a subtle glow behind it
          const cx = engine.player.x;
          const cy = engine.player.y - 60 + floatY + hoverY;
          
          const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
          glow.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, cy, 40, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(fsImg, cx - 30, cy - 30, 60, 60);
          ctx.restore();
        }
      }

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
