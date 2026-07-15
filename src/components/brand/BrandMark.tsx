'use client';

import { useLenis } from '@/animation/LenisProvider';
import { Logo } from './Logo';

/**
 * Fixed brand anchor in the free top-left corner (the edge-text rail sits
 * right-center, the radial menu top-right). Smooth-scrolls to the top via the
 * shared Lenis instance, mirroring BackToTop.
 */
export function BrandMark({ label }: { label: string }) {
  const lenisRef = useLenis();
  const toTop = () => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'auto' });
  };
  return (
    <button type="button" onClick={toTop} className="brand-mark">
      <Logo variant="mark" label={label} />
    </button>
  );
}
