'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** seconds between each item */
  stagger?: number;
  /** delay before the sequence starts */
  delay?: number;
};

/**
 * Reusable "word rise" scroll reveal: descendants marked `[data-reveal-item]`
 * (or the wrapper itself if none) rise with a slight skew settle when the block
 * scrolls into view. Runs once, leak-free via useGSAP, disabled under reduced motion.
 */
export function Reveal({ children, className, stagger = 0.12, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const items = el.querySelectorAll('[data-reveal-item]');
      const targets: gsap.TweenTarget = items.length ? items : el;

      gsap.set(targets, { opacity: 0, y: 14, skewY: 3 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 0.7,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
