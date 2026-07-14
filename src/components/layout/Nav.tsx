'use client';

import { useMemo } from 'react';
import { useLenis } from '@/animation/LenisProvider';
import { useActiveSection } from '@/hooks/useActiveSection';

export type NavItem = { id: string; label: string };

/**
 * In-page navigation. Smooth-scrolls to sections via the shared Lenis instance
 * (falling back to native scrolling under reduced motion) and highlights the
 * section currently in view. Targets absent from the DOM (e.g. a not-yet-built
 * `contact` section) fall through to default anchor behavior.
 */
export function Nav({ items }: { items: NavItem[] }) {
  const lenisRef = useLenis();
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    const target = document.getElementById(id);
    if (!target) return; // let the browser handle a missing target
    e.preventDefault();

    const header = document.querySelector('header');
    const offset = (header?.getBoundingClientRect().height ?? 0) + 12;
    // Absolute document target computed at click time, so it stays correct even
    // if a previous smooth-scroll is still in flight (passing the element lets
    // Lenis drift against its virtual scroll and overshoot).
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(top);
    } else {
      window.scrollTo({ top, behavior: 'auto' });
    }
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav className="text-muted hidden gap-6 text-sm sm:flex">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={handleClick(item.id)}
          data-active={active === item.id}
          className="nav-link hover:text-foreground data-[active=true]:text-foreground"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
