import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';

interface MinimapWidgetProps {
  engine: GameEngine;
}

export const MinimapWidget: React.FC<MinimapWidgetProps> = ({ engine }) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderMinimap = () => {
      const size = canvas.width;
      const center = size / 2;
      const scale = size / 10000; // Scale 10,000px map to minimap canvas

      ctx.clearRect(0, 0, size, size);

      // Circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, center - 2, 0, Math.PI * 2);
      ctx.clip();

      // Terrain Background
      ctx.fillStyle = '#0a140d';
      ctx.fillRect(0, 0, size, size);

      // Firefly Lake (East)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(8000 * scale, 3500 * scale, 1100 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Waterfall Pools (Northeast)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(8000 * scale, 1500 * scale, 700 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Arcade Ruins Glow (Northwest)
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(2000 * scale, 1500 * scale, 600 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Cauliflower Ridge Sunset Glow (Southwest)
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(2000 * scale, 8200 * scale, 800 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Connecting Trail Network
      ctx.strokeStyle = '#2d4030';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(5000 * scale, 5000 * scale); // Central Glade
      ctx.lineTo(2000 * scale, 1500 * scale); // Arcade Ruins
      ctx.lineTo(2000 * scale, 2800 * scale); // Rain Bench
      ctx.lineTo(2000 * scale, 4800 * scale); // Meadow
      ctx.lineTo(5000 * scale, 2000 * scale); // Whisper Tree
      ctx.lineTo(8000 * scale, 1500 * scale); // Starlight Bridge
      ctx.lineTo(8000 * scale, 3500 * scale); // Lake
      ctx.lineTo(8000 * scale, 4800 * scale); // Coffee Corner
      ctx.lineTo(8000 * scale, 7800 * scale); // Memory Hollow
      ctx.lineTo(5000 * scale, 8500 * scale); // Observatory
      ctx.lineTo(2000 * scale, 8200 * scale); // Cauliflower Ridge
      ctx.lineTo(2000 * scale, 9200 * scale); // Train Station
      ctx.stroke();

      // Fireflies Dots
      engine.fireflies.forEach((f) => {
        if (!f.collected) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(f.x * scale - 1, f.y * scale - 1, 2, 2);
        }
      });

      // Cassette Tape Markers on Minimap (Static, non-blinking markers)
      engine.tapes.forEach((t) => {
        const tx = t.x * scale;
        const ty = t.y * scale;

        if (!t.unlocked) {
          // Uncollected Tape: Solid Cyan Box with Outer Halo Ring
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(tx - 3.5, ty - 2.5, 7, 5);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx - 1.5, ty - 1, 3, 2);
        } else {
          // Unlocked Tape: Soft Cyan Circle
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Active Story Destination Beacon
      const activeWp = engine.getActiveStoryWaypoint();
      if (activeWp) {
        const wpX = activeWp.x * scale;
        const wpY = activeWp.y * scale;

        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(wpX, wpY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Direction Arrow from player to target
        const playerX = engine.player.x * scale;
        const playerY = engine.player.y * scale;

        const angle = Math.atan2(activeWp.y - engine.player.y, activeWp.x - engine.player.x);

        const arrowDist = 28;
        const arrowX = playerX + Math.cos(angle) * arrowDist;
        const arrowY = playerY + Math.sin(angle) * arrowDist;

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player Icon (Center purple dot)
      const px = engine.player.x * scale;
      const py = engine.player.y * scale;

      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // Circular Border
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center, center, center - 2, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(renderMinimap);
    };

    animId = requestAnimationFrame(renderMinimap);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine]);

  const storyObj = engine.getStoryObjectiveInfo();

  return (
    <div className="minimap-widget-container pointer-events-auto">
      <canvas
        ref={minimapCanvasRef}
        width={140}
        height={140}
        className="minimap-canvas"
      />
      {storyObj && (
        <div className="minimap-distance-tag">
          🎯 {storyObj.distanceMeters}m
        </div>
      )}
    </div>
  );
};
