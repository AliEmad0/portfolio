'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLenis } from '@/animation/LenisProvider';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useLocaleDir } from '@/hooks/useLocaleDir';

export type NavItem = { id: string; label: string };

/**
 * Radial menu: a toggle whose section links bloom outward in a curved fan.
 * Smooth-scrolls via the shared Lenis instance (native fallback under reduced
 * motion) and highlights the section in view. Targets absent from the DOM fall
 * through to default anchor behavior. Closes on Escape or an outside click.
 */
export function RadialNav({
  items,
  menuLabel,
  closeLabel,
}: {
  items: NavItem[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const lenisRef = useLenis();
  const { sign } = useLocaleDir();
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    const target = document.getElementById(id);
    setOpen(false);
    if (!target) return; // let the browser handle a missing target
    e.preventDefault();
    const header = document.querySelector('header');
    const offset = (header?.getBoundingClientRect().height ?? 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: 'auto' });
    history.replaceState(null, '', `#${id}`);
  };

  const n = items.length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? closeLabel : menuLabel}
        onClick={() => setOpen((o) => !o)}
        className="radial-toggle"
      >
        <span className="radial-icon" aria-hidden>
          <span />
          <span />
        </span>
      </button>

      <ul className="radial-fan" data-open={open}>
        {items.map((item, i) => {
          const t = n > 1 ? i / (n - 1) : 0;
          // Gentle quarter-sine curve inward; direction flips for RTL.
          const x = Math.round(Math.sin((t * Math.PI) / 2) * 46) * -sign;
          const y = 54 + i * 46;
          const style = {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--d': `${i * 0.04}s`,
          } as CSSProperties;
          return (
            <li key={item.id} className="radial-item" style={style}>
              <a
                href={`#${item.id}`}
                onClick={go(item.id)}
                data-active={active === item.id}
                tabIndex={open ? 0 : -1}
                className="radial-link"
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
