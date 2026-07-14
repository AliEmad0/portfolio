'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(useGSAP);

/**
 * A brief whole-page settle on first load: the wrapped shell fades/rises into
 * place. The hidden start state is applied inside useGSAP (useLayoutEffect,
 * before paint) so there is no flash-of-hidden-content and, without JS, the
 * content renders visible. Skipped entirely under reduced motion.
 */
export function PageEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return <div ref={ref}>{children}</div>;
}
