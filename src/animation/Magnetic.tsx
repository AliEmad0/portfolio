'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(useGSAP);

/**
 * Wraps a child so it drifts toward the pointer while hovered, springing back
 * on leave — a subtle "magnetic" pull for a primary CTA. Disabled under reduced
 * motion and on coarse (touch) pointers, where it renders a plain wrapper.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: React.ReactNode;
  /** Fraction of pointer offset applied as translation. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
      const el = ref.current;
      if (!el) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: ref, dependencies: [reduced, strength] },
  );

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}
