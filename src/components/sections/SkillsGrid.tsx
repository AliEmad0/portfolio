'use client';

import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocaleDir } from '@/hooks/useLocaleDir';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COLORS = ['var(--color-accent)', 'var(--color-accent-2)', 'var(--color-accent-3)'];

export type SkillCategory = { category: string; items: string[] };

export function SkillsGrid({ categories }: { categories: SkillCategory[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { sign } = useLocaleDir();

  useGSAP(
    () => {
      if (reduced) return;
      const root = ref.current;
      if (!root) return;
      const chips = root.querySelectorAll('.skill-chip');

      gsap.set(chips, { opacity: 0, x: (i: number) => (i % 2 ? 26 : -26) * sign });
      gsap.to(chips, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 80%', once: true },
        onComplete: () => root.classList.add('is-live'),
      });
    },
    { scope: ref, dependencies: [reduced, sign] },
  );

  let chipIndex = 0;

  return (
    <div ref={ref} className="flex flex-col gap-8">
      {categories.map((cat, ci) => {
        const color = COLORS[ci % COLORS.length];
        return (
          <div key={ci}>
            <h3 className="mb-3 text-sm font-semibold" style={{ color }}>
              {cat.category}
            </h3>
            <ul className="flex flex-wrap gap-2.5">
              {cat.items.map((item) => (
                <li
                  key={item}
                  className="skill-chip rounded-full px-3.5 py-1.5 font-mono text-sm"
                  style={{ '--sk': color, '--i': chipIndex++ } as CSSProperties}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
