'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view via IntersectionObserver.
 * Returns the id of the most-visible observed section, or `''` before any
 * intersects. Ids whose elements are absent from the DOM are simply ignored,
 * so they never become active. No motion — safe under reduced motion.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Track the visible ratio of each section; the most-visible one wins.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0.1, 0.35, 0.6, 0.85], rootMargin: '-20% 0px -35% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
