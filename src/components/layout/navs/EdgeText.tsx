'use client';

import { useMemo } from 'react';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useNavScroll } from '@/hooks/useNavScroll';
import type { NavItem } from '../RadialNav';

/** #10 — rotated section links stacked along the edge of the viewport. */
export function EdgeText({ items }: { items: NavItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);
  const nav = useNavScroll();
  return (
    <nav className="edge-text" aria-label="Sections">
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          onClick={nav(it.id)}
          data-active={active === it.id}
          className="edge-link"
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
