import React, { useEffect, useRef, useState } from 'react';

export const ArcadeMinigame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isActive = true;
    let frames = 0;

    const ship = { x: 150, y: 350, w: 20, h: 20, vx: 0, speed: 5 };
    const meteors: { x: number; y: number; size: number; speed: number; hue: number }[] = [];
    const stars: { x: number; y: number; speed: number }[] = [];
    
    // Init stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * 300,
        y: Math.random() * 400,
        speed: 0.5 + Math.random() * 1.5
      });
    }

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    // Need to use window so we can catch arrow keys easily without focus
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const render = () => {
      if (!isActive) return;

      // Update
      if (keys['ArrowLeft'] || keys['KeyA']) ship.x -= ship.speed;
      if (keys['ArrowRight'] || keys['KeyD']) ship.x += ship.speed;
      
      // Bounds
      if (ship.x < 15) ship.x = 15;
      if (ship.x > 285) ship.x = 285;

      // Meteors
      if (frames % 20 === 0) {
        meteors.push({
          x: Math.random() * 280 + 10,
          y: -20,
          size: 8 + Math.random() * 15,
          speed: 3 + Math.random() * 4 + (frames / 1000), // slowly gets faster
          hue: Math.random() * 60 // warm colors
        });
      }

      // Draw Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 300, 400);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > 400) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ship
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - ship.h);
      ctx.lineTo(ship.x + ship.w / 2, ship.y);
      ctx.lineTo(ship.x - ship.w / 2, ship.y);
      ctx.fill();

      // Ship Thruster
      if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['KeyA'] || keys['KeyD']) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(ship.x - 4, ship.y);
        ctx.lineTo(ship.x + 4, ship.y);
        ctx.lineTo(ship.x, ship.y + 10 + Math.random() * 5);
        ctx.fill();
      }

      // Move & Draw Meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.y += m.speed;
        
        ctx.fillStyle = `hsl(${m.hue}, 80%, 50%)`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();

        // Collision
        const dist = Math.hypot(ship.x - m.x, (ship.y - ship.h / 2) - m.y);
        if (dist < m.size + ship.w / 2 - 2) {
          // Game Over
          isActive = false;
          setGameOver(true);
        }

        if (m.y > 420) {
          meteors.splice(i, 1);
        }
      }

      if (isActive) {
        setScore(Math.floor(frames / 10));
        frames++;
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '300px', margin: '0 auto', border: '2px solid #a855f7', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }}>
      <canvas ref={canvasRef} width={300} height={400} style={{ display: 'block', width: '300px', height: '400px' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>
        SCORE: {score}
      </div>
      {gameOver && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ef4444', fontFamily: 'monospace', margin: 0, fontSize: '24px' }}>GAME OVER</h2>
          <p style={{ color: '#fff', fontFamily: 'monospace' }}>Final Score: {score}</p>
          <div style={{ color: '#a855f7', fontSize: '12px', marginTop: '10px' }}>Press ESC to exit</div>
        </div>
      )}
    </div>
  );
};
