'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Star = {
  x: number;
  y: number;
  vx: number; // transient velocity from cursor scatter (decays)
  vy: number;
  ang: number; // drift heading
  speed: number; // constant drift speed
  wp: number; // wander phase — slowly curves the heading
  wps: number; // wander phase speed
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
 * slowly and endlessly on gently curving random paths, wrapping around the
 * screen edges so the field never settles. Near the pointer they scatter, then
 * ease back into their drift. Canvas-based for performance; `pointer-events:
 * none` so it never blocks the cursor. Static (no motion, no scatter) under
 * reduced motion.
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
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          ang: Math.random() * Math.PI * 2, // random heading
          speed: Math.random() * 0.1 + 0.04, // slow drift, ~2.5–8 px/s
          wp: Math.random() * Math.PI * 2,
          wps: Math.random() * 0.006 + 0.002,
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

        // cursor scatter — push away, decays via friction below
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / R) * 2.4;
          s.vx += (dx / d) * force;
          s.vy += (dy / d) * force;
        }
        s.vx *= 0.9;
        s.vy *= 0.9;

        // endless slow drift on a gently curving random heading
        s.wp += s.wps;
        s.ang += Math.sin(s.wp) * 0.02;
        s.x += Math.cos(s.ang) * s.speed + s.vx;
        s.y += Math.sin(s.ang) * s.speed + s.vy;

        // wrap around edges → infinite field
        const m = s.r + 1;
        if (s.x < -m) s.x = w + m;
        else if (s.x > w + m) s.x = -m;
        if (s.y < -m) s.y = h + m;
        else if (s.y > h + m) s.y = -m;

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
