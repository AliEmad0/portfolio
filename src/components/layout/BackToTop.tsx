'use client';

import { useLenis } from '@/animation/LenisProvider';

/** Smooth-scrolls to the top via the shared Lenis instance (native fallback). */
export function BackToTop({ label }: { label: string }) {
  const lenisRef = useLenis();
  const toTop = () => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'auto' });
  };
  return (
    <button type="button" onClick={toTop} aria-label={label} className="to-top">
      <span aria-hidden>↑</span>
    </button>
  );
}
