'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Star = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  base: number; // base opacity
  tw: number; // twinkle phase
  tws: number; // twinkle speed
  color: string;
};

// White with subtle accent tints — a galaxy shimmer.
const COLORS = ['#ffffff', '#ffffff', '#c9c3ff', '#a9f0e6', '#ffd1ec'];

/**
 * Full-app interactive starfield. Small twinkling stars of random sizes drift
 * behind everything; near the pointer they scatter and spring back. Canvas-based
 * for performance; `pointer-events: none` so it never blocks the cursor. Static
 * (no motion, no scatter) under reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(260, Math.round((w * h) / 9000));
      stars = Array.from({ length: count }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          hx: x,
          hy: y,
          x,
          y,
          vx: 0,
          vy: 0,
          r: Math.random() * 1.3 + 0.3, // small, random sizes
          base: Math.random() * 0.5 + 0.2,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.02 + 0.004,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        };
      });
    };

    const paint = (s: Star, alpha: number) => {
      ctx.globalAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    };

    // Static render (reduced motion): draw once, no loop, no interaction.
    if (reduced) {
      build();
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) paint(s, s.base);
      ctx.globalAlpha = 1;
      const onResize = () => {
        build();
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) paint(s, s.base);
        ctx.globalAlpha = 1;
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const R = 120; // cursor influence radius
    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.tw += s.tws;
        const alpha = s.base + Math.sin(s.tw) * 0.28;

        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / R) * 2.4;
          s.vx += (dx / d) * force;
          s.vy += (dy / d) * force;
        }
        // spring home + friction
        s.vx += (s.hx - s.x) * 0.012;
        s.vy += (s.hy - s.y) * 0.012;
        s.vx *= 0.85;
        s.vy *= 0.85;
        s.x += s.vx;
        s.y += s.vy;

        paint(s, alpha);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', build);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return <canvas ref={ref} className="starfield" aria-hidden />;
}
