'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocaleDir } from '@/hooks/useLocaleDir';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type TimelineItemProps = {
  index: number;
  ghostYear: string;
  period: string;
  title: string;
  org: string;
  description: string;
};

export function TimelineItem({
  index,
  ghostYear,
  period,
  title,
  org,
  description,
}: TimelineItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { sign } = useLocaleDir();

  // Ghost year slides in from the inline-start side; body fades up just after.
  // On complete, .is-live starts the CSS underglow loop on the ghost year.
  useGSAP(
    () => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const ghost = el.querySelector('[data-ghost]');
      const body = el.querySelector('[data-body]');
      if (!ghost || !body) return;

      gsap.set(ghost, { opacity: 0, x: -60 * sign });
      gsap.set(body, { opacity: 0, y: 14 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        onComplete: () => el.classList.add('is-live'),
      });
      tl.to(ghost, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: index * 0.06,
      }).to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.35');
    },
    { scope: ref, dependencies: [reduced, sign] },
  );

  return (
    <div ref={ref} className="relative pb-14 last:pb-0">
      <span
        data-ghost
        aria-hidden
        className="ghost-year pointer-events-none absolute -top-1 z-0 text-[clamp(3rem,9vw,6rem)] select-none"
        style={{ insetInlineStart: 0 }}
      >
        {ghostYear}
      </span>
      <div data-body className="relative z-10 max-w-2xl ps-1 pt-10">
        <p className="text-accent-2 font-mono text-xs tracking-wide">{period}</p>
        <h3 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">{title}</h3>
        <p className="text-muted mt-1 text-sm font-medium">{org}</p>
        <p className="text-muted mt-3 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
