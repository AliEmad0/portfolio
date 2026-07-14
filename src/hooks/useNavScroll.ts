'use client';

import { useLenis } from '@/animation/LenisProvider';

/**
 * Returns a click-handler factory for in-page navigation: smooth-scrolls to a
 * section via the shared Lenis instance (native fallback under reduced motion),
 * computing an absolute target so it stays correct mid-animation. Targets absent
 * from the DOM fall through to default anchor behavior.
 */
export function useNavScroll() {
  const lenisRef = useLenis();
  return (id: string, opts?: { offset?: number; onDone?: () => void }) => (e: React.MouseEvent) => {
    const target = document.getElementById(id);
    opts?.onDone?.();
    if (!target) return;
    e.preventDefault();
    const offset = opts?.offset ?? 24;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: 'auto' });
    history.replaceState(null, '', `#${id}`);
  };
}
