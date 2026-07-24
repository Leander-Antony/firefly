import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Eye } from 'lucide-react';
import { SoundEngine } from '../audio/SoundEngine';

interface TelescopeModalProps {
  onClose: () => void;
}

interface Constellation {
  id: string;
  name: string;
  description: string;
  stars: Array<{ x: number; y: number }>;
  color: string;
  hexRGB: [number, number, number];
}

const CONSTELLATIONS: Constellation[] = [
  {
    id: 'lantern_cluster',
    name: 'The Firefly Lantern',
    description:
      'A cluster of 7 bright stars forming an iron lantern. Travelers say it guides lost spirits through the night.',
    color: '#fde047',
    hexRGB: [253, 224, 71],
    stars: [
      { x: 50, y: 22 },
      { x: 41, y: 38 },
      { x: 59, y: 38 },
      { x: 35, y: 53 },
      { x: 65, y: 53 },
      { x: 50, y: 64 },
      { x: 50, y: 13 },
    ],
  },
  {
    id: 'two_paths',
    name: 'The Parallel Trails',
    description:
      'Two faint star streams that unknowingly cross the same night sky horizon.',
    color: '#38bdf8',
    hexRGB: [56, 189, 248],
    stars: [
      { x: 18, y: 20 },
      { x: 30, y: 33 },
      { x: 43, y: 47 },
      { x: 82, y: 20 },
      { x: 70, y: 33 },
      { x: 57, y: 47 },
    ],
  },
  {
    id: 'coffee_cup',
    name: 'The Warm Cup',
    description:
      'Four warm stars arranged in the shape of a ceramic mug — a comfort constellation.',
    color: '#fb923c',
    hexRGB: [251, 146, 60],
    stars: [
      { x: 65, y: 60 },
      { x: 80, y: 60 },
      { x: 82, y: 75 },
      { x: 63, y: 75 },
    ],
  },
];

// 60 background stars — fully deterministic, never re-seeded
const BG_STARS = Array.from({ length: 60 }, (_, i) => ({
  // Use golden-ratio-based spiral spread to avoid clustering
  nx: ((i * 0.618033988 % 1) * 0.82 + 0.09),   // 0..1 normalised x
  ny: ((i * 0.381966011 % 1) * 0.82 + 0.09),   // 0..1 normalised y
  r: 0.8 + (i % 5) * 0.28,
  baseOp: 0.2 + (i % 8) * 0.1,
  speed: 0.4 + (i % 6) * 0.25,
  phase: i * 1.1,
  warm: i % 7 === 0,   // warm-tinted star
  blue: i % 11 === 0,  // blue-tinted star
}));

// ────────────────────────────────────────────────────────────
//  CANVAS RENDERER — draws everything in a single 2D context
// ────────────────────────────────────────────────────────────
function drawTelescope(
  canvas: HTMLCanvasElement,
  t: number,           // seconds elapsed
  sel: Constellation,
  hitStars: Array<{ x: number; y: number; id: string }> // pixel coords for hit-test
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) * 0.82;   // radius of the visible sky aperture
  const fullR = Math.min(cx, cy);       // outer radius of brass bezel

  ctx.clearRect(0, 0, W, H);

  // ── 1. CIRCULAR CLIP for sky area ──────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Deep space background
  const skyGrad = ctx.createRadialGradient(cx * 0.9, cy * 0.85, 0, cx, cy, R);
  skyGrad.addColorStop(0,    '#1a1845');
  skyGrad.addColorStop(0.38, '#0d1232');
  skyGrad.addColorStop(0.72, '#06091f');
  skyGrad.addColorStop(1,    '#020410');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Nebula layer A — purple
  const nebA = ctx.createRadialGradient(cx * 0.65, cy * 1.1, 0, cx * 0.65, cy * 1.1, R * 0.65);
  nebA.addColorStop(0,   'rgba(88,28,135,0.42)');
  nebA.addColorStop(0.5, 'rgba(76,29,149,0.15)');
  nebA.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = nebA;
  ctx.fillRect(0, 0, W, H);

  // Nebula layer B — teal
  const nebB = ctx.createRadialGradient(cx * 1.3, cy * 0.6, 0, cx * 1.3, cy * 0.6, R * 0.5);
  nebB.addColorStop(0,   'rgba(7,89,133,0.28)');
  nebB.addColorStop(0.6, 'rgba(14,116,144,0.1)');
  nebB.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = nebB;
  ctx.fillRect(0, 0, W, H);

  // ── 2. BACKGROUND STARS ────────────────────────────────────
  BG_STARS.forEach((s) => {
    const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(t * s.speed + s.phase));
    const op = s.baseOp * twinkle;
    const sx = s.nx * W;
    const sy = s.ny * H;
    const color = s.warm
      ? `rgba(254,240,180,${op})`
      : s.blue
      ? `rgba(147,210,255,${op})`
      : `rgba(255,255,255,${op})`;

    ctx.save();
    if (s.r > 1.2) {
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3);
      grd.addColorStop(0,   s.warm ? `rgba(255,240,180,${op * 0.9})` : `rgba(255,255,255,${op * 0.9})`);
      grd.addColorStop(0.4, s.warm ? `rgba(255,230,140,${op * 0.3})` : `rgba(180,220,255,${op * 0.25})`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── 3. CONSTELLATION LINES ─────────────────────────────────
  const [sr, sg, sb] = sel.hexRGB;
  const lineAlpha = 0.5 + 0.15 * Math.sin(t * 1.2);

  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = `rgba(${sr},${sg},${sb},${lineAlpha})`;
  ctx.shadowColor = sel.color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  sel.stars.forEach((s, idx) => {
    const px = (s.x / 100) * W;
    const py = (s.y / 100) * H;
    if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();

  // ── 4. CONSTELLATION STAR NODES ────────────────────────────
  hitStars.length = 0;
  sel.stars.forEach((s, idx) => {
    const px = (s.x / 100) * W;
    const py = (s.y / 100) * H;
    const pulse = 3.5 + 2.5 * Math.abs(Math.sin(t * 1.8 + idx * 0.9));

    // Outer glow halo
    const halo = ctx.createRadialGradient(px, py, 0, px, py, pulse * 3);
    halo.addColorStop(0,   `rgba(${sr},${sg},${sb},0.65)`);
    halo.addColorStop(0.4, `rgba(${sr},${sg},${sb},0.2)`);
    halo.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(px, py, pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core star dot
    ctx.fillStyle = sel.color;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.fill();

    // White centre sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(px, py, pulse * 0.35, 0, Math.PI * 2);
    ctx.fill();

    hitStars.push({ x: px, y: py, id: `${sel.id}_star_${idx}` });
  });

  ctx.restore(); // restore sky clip

  // ── 5. LENS VIGNETTE (dark edge inside viewport) ───────────
  const vigGrad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
  vigGrad.addColorStop(0,   'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1,   'rgba(0,0,0,0.55)');
  ctx.fillStyle = vigGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // ── 6. RETICLE CROSSHAIRS ──────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([]);
  // horizontal
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx - R * 0.12, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + R * 0.12, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
  // vertical
  ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy - R * 0.12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + R * 0.12); ctx.lineTo(cx, cy + R); ctx.stroke();
  // centre rings
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.1, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.setLineDash([3, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  // centre dot
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── 7. BRASS BEZEL RING ─────────────────────────────────────
  // Uses a donut shape — draw from fullR inward to R, never touching the sky area

  // Outer border shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  // Dark backing ring (between sky edge and brass)
  ctx.strokeStyle = '#0a0603';
  ctx.lineWidth = (fullR - R) * 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, R + (fullR - R) * 0.09, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // Brass gradient ring (wide outer ring)
  const ring = fullR - R;
  const brassGrad = ctx.createLinearGradient(0, 0, W, H);
  brassGrad.addColorStop(0,    '#fffbe6');
  brassGrad.addColorStop(0.15, '#fde047');
  brassGrad.addColorStop(0.38, '#d97706');
  brassGrad.addColorStop(0.62, '#92400e');
  brassGrad.addColorStop(0.82, '#78350f');
  brassGrad.addColorStop(1,    '#431407');

  ctx.strokeStyle = brassGrad;
  ctx.lineWidth = ring * 0.62;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.31 + ring * 0.01, 0, Math.PI * 2);
  ctx.stroke();

  // Bright highlight arc (upper-left sheen)
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,220,0.28)';
  ctx.lineWidth = ring * 0.18;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.31, Math.PI * 1.1, Math.PI * 1.75);
  ctx.stroke();
  ctx.restore();

  // Inner separator groove (dark channel between brass ring and inner accent)
  ctx.strokeStyle = '#18090a';
  ctx.lineWidth = ring * 0.08;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  // Inner accent ring (thinner, opposing gradient)
  const accentGrad = ctx.createLinearGradient(W, H, 0, 0);
  accentGrad.addColorStop(0,    '#fef9c3');
  accentGrad.addColorStop(0.4,  '#ca8a04');
  accentGrad.addColorStop(1,    '#78350f');
  ctx.strokeStyle = accentGrad;
  ctx.lineWidth = ring * 0.2;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Inner edge dark lip (where lens meets brass)
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = ring * 0.07;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.025, 0, Math.PI * 2);
  ctx.stroke();

  // Tick marks around the inner accent ring
  const tickR = R + ring * 0.78;
  ctx.save();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  for (let deg = 0; deg < 360; deg += 10) {
    const a = (deg * Math.PI) / 180;
    const inner = tickR - (deg % 90 === 0 ? 6 : deg % 30 === 0 ? 4 : 2.5);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * tickR,  cy + Math.sin(a) * tickR);
    ctx.lineTo(cx + Math.cos(a) * inner,  cy + Math.sin(a) * inner);
    ctx.stroke();
  }
  ctx.restore();

  // Cardinal letters N S E W on the outer bezel
  const cardR = R + ring * 0.36;
  ctx.save();
  ctx.fillStyle = '#3d1a03';
  ctx.font = `bold ${Math.round(ring * 0.26)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cards: [string, number][] = [['N', -Math.PI / 2], ['S', Math.PI / 2], ['E', 0], ['W', Math.PI]];
  cards.forEach(([ltr, a]) => {
    ctx.fillText(ltr, cx + Math.cos(a) * cardR, cy + Math.sin(a) * cardR);
  });
  ctx.restore();

  // Outer rim dark edge
  ctx.strokeStyle = '#1a0d04';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, fullR - 2, 0, Math.PI * 2);
  ctx.stroke();
}

// ────────────────────────────────────────────────────────────
export const TelescopeModal: React.FC<TelescopeModalProps> = ({ onClose }) => {
  const [selected, setSelected] = useState<Constellation>(CONSTELLATIONS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const t0 = useRef(performance.now());
  const hitStarsRef = useRef<Array<{ x: number; y: number; id: string }>>([]);

  // Resize canvas to match container DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const size = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // RAF draw loop
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);

    const loop = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const t = (performance.now() - t0.current) / 1000;
        drawTelescope(canvas, t, selectedRef.current, hitStarsRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [resizeCanvas]);

  const handleSelect = (c: Constellation) => {
    setSelected(c);
    SoundEngine.playFireflyCollect();
  };

  // Click-to-select: find the nearest constellation's anchor star
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let best: Constellation | null = null;
    let bestDist = Infinity;

    CONSTELLATIONS.forEach((c) => {
      const anchor = c.stars[0];
      const px = (anchor.x / 100) * rect.width;
      const py = (anchor.y / 100) * rect.height;
      const dist = Math.hypot(mx - px, my - py);
      if (dist < bestDist) { bestDist = dist; best = c; }
    });

    if (best && bestDist < 50) {
      handleSelect(best);
    }
  };

  return (
    <div className="modal-backdrop z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        className="relative bg-slate-950 border border-purple-500/20 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-center text-slate-100 overflow-hidden"
      >
        {/* Ambient card glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 50% at 50% 25%, rgba(88,28,135,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors z-40"
          title="Close Telescope View"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-center gap-2 mb-4 text-purple-300 font-serif">
          <Eye size={22} className="text-amber-300 animate-pulse" />
          <h2 className="text-xl font-bold tracking-wide">Forgotten Observatory Lens</h2>
        </div>

        {/* ── CANVAS VIEWPORT ── */}
        <div
          ref={containerRef}
          className="relative mx-auto"
          style={{ width: 'min(340px, 78vw)', height: 'min(340px, 78vw)' }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="rounded-full cursor-crosshair block"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* ── Constellation selector pills ── */}
        <div className="relative z-10 flex gap-2 justify-center mt-5 flex-wrap">
          {CONSTELLATIONS.map((c) => {
            const isActive = selected.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-200 flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? c.color : 'rgba(15,23,42,0.6)',
                  borderColor: isActive ? c.color : 'rgba(100,116,139,0.35)',
                  color: isActive ? '#0f172a' : '#94a3b8',
                  fontWeight: isActive ? 700 : 400,
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 14px ${c.color}60` : 'none',
                }}
              >
                <Sparkles size={11} />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* ── Description card ── */}
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-3 p-4 rounded-2xl border text-center"
          style={{
            backgroundColor: `${selected.color}0d`,
            borderColor: `${selected.color}28`,
          }}
        >
          <h3
            className="text-sm font-serif font-bold flex items-center justify-center gap-2"
            style={{ color: selected.color }}
          >
            <Sparkles size={14} /> {selected.name}
          </h3>
          <p className="text-xs font-serif italic text-purple-200/75 mt-1 leading-relaxed">
            "{selected.description}"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
