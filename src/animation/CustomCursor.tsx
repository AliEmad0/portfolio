'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const INTERACTIVE = 'a, button, [data-cursor], input, textarea, select, [role="button"]';

/**
 * A custom pointer: a small dot that tracks precisely plus a trailing ring that
 * grows over interactive elements. Desktop only — renders nothing on coarse
 * (touch) pointers or under reduced motion, leaving the native cursor untouched.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Capability detection must run after mount: rendering `null` on the server and
  // the first client render (then enabling) keeps hydration consistent and avoids a
  // stray cursor on touch devices. This is the standard mounted-flag idiom.
  useEffect(() => {
    const ok =
      !reduced && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe post-mount capability flip
    setEnabled(ok);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('has-custom-cursor');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      gsap.to(ring, { scale: hit ? 1.8 : 1, opacity: hit ? 0.9 : 0.6, duration: 0.25 });
    };
    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.15 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.15 });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ringRef}
        className="border-accent absolute top-0 left-0 h-8 w-8 rounded-full border opacity-60"
      />
      <div ref={dotRef} className="bg-accent-2 absolute top-0 left-0 h-1.5 w-1.5 rounded-full" />
    </div>
  );
}
