'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks which section is in view. A section becomes active once its top passes
 * a line ~a third down the viewport; at the very bottom the last section wins
 * (so a short footer `#contact` can activate — it can never be scrolled high
 * enough on its own). Ids absent from the DOM are ignored.
 *
 * Position is polled via requestAnimationFrame rather than the `scroll` event:
 * Lenis smooth-scroll does not emit native `scroll` events, so a listener alone
 * would never update. A `scroll` listener is kept too for the reduced-motion
 * (no-Lenis) path. No animation of its own; reduced-motion safe.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const compute = () => {
      const els = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;

      const scrollY = window.scrollY;
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(last.id);
        return;
      }
      const line = scrollY + window.innerHeight * 0.32;
      let current = first.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top + scrollY <= line) current = el.id;
      }
      setActive(current);
    };

    let raf = 0;
    let lastY = -1;
    const tick = () => {
      if (window.scrollY !== lastY) {
        lastY = window.scrollY;
        compute();
      }
      raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      lastY = -1; // force a recompute on the next frame
    };

    compute();
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', onResize);
    };
  }, [ids]);

  return active;
}
