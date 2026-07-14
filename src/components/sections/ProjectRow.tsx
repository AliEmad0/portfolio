'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocaleDir } from '@/hooks/useLocaleDir';
import { ProjectVisual } from './ProjectVisual';

export type ProjectStatus = { label: string; tone: 'live' | 'wip' | 'archived' };

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type ProjectRowProps = {
  index: number;
  name: string;
  summary: string;
  description: string;
  stack: string[];
  image: string;
  href: string;
  featuredLabel?: string;
  status?: ProjectStatus;
  viewLabel: string;
  numberLabel: string;
};

function FeaturedTag({ label }: { label: string }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase"
      style={{
        color: 'var(--color-accent-2)',
        borderColor: 'color-mix(in srgb, var(--color-accent-2) 40%, transparent)',
      }}
    >
      {label}
    </span>
  );
}

const STATUS_COLOR: Record<ProjectStatus['tone'], string> = {
  live: 'var(--color-accent-2)',
  wip: '#f5b544',
  archived: 'var(--color-muted)',
};

function StatusTag({ label, tone }: ProjectStatus) {
  const color = STATUS_COLOR[tone];
  return (
    <span
      className="proj-status"
      style={{ color, borderColor: `color-mix(in srgb, ${color} 42%, transparent)` }}
    >
      <span className="proj-status-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

export function ProjectRow({
  index,
  name,
  summary,
  description,
  stack,
  image,
  href,
  featuredLabel,
  status,
  viewLabel,
  numberLabel,
}: ProjectRowProps) {
  const flip = index % 2 === 1;
  const wrapRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { sign } = useLocaleDir();
  const external = href.startsWith('http');

  useGSAP(
    () => {
      if (reduced) return;
      const wrap = wrapRef.current;
      const curtain = curtainRef.current;
      if (!wrap || !curtain) return;

      gsap.set(wrap, { opacity: 0, x: (flip ? 36 : -36) * sign });
      gsap.set(curtain, { scaleX: 1, transformOrigin: 'right' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
        onComplete: () => wrap.classList.add('is-live'),
      });
      tl.to(wrap, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: index * 0.05 }).to(
        curtain,
        { scaleX: 0, duration: 0.55, ease: 'power2.inOut' },
        '-=0.08',
      );
    },
    { scope: wrapRef, dependencies: [reduced, sign] },
  );

  return (
    <div ref={wrapRef}>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className={`proj-card border-border flex flex-col gap-4 rounded-2xl border bg-white/[0.02] p-4 md:items-center md:gap-6 md:p-5 ${
          flip ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
      >
        {/* mobile header — number + name above the screenshot */}
        <div className="flex flex-col gap-1.5 md:hidden">
          <span className="text-accent font-mono text-xs">
            {numberLabel}
            {featuredLabel ? ` · ${featuredLabel}` : ''}
          </span>
          <span className="flex flex-wrap items-center gap-2 text-lg font-bold text-white">
            {name}
            {featuredLabel && <FeaturedTag label={featuredLabel} />}
            {status && <StatusTag {...status} />}
          </span>
        </div>

        {/* media */}
        <div
          className="border-border relative aspect-[16/10] w-full flex-none overflow-hidden rounded-xl border md:w-44"
          style={{ background: 'radial-gradient(70% 90% at 65% 25%, #2a2350, #0c0c15 72%)' }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white/10">
            {name.charAt(0)}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot, no optimization needed */}
          <img
            src={image}
            alt={`${name} preview`}
            loading="lazy"
            className="absolute inset-0 z-[1] h-full w-full object-cover"
          />
          <div
            className="proj-overlay absolute inset-0 z-[2] opacity-0"
            style={{
              background: 'linear-gradient(150deg, rgba(124,92,255,0.55), transparent 70%)',
            }}
          />
          <div
            ref={curtainRef}
            className="proj-curtain bg-accent absolute inset-0 z-[3]"
            style={{ transformOrigin: 'right' }}
          />
          <div
            className="proj-wash pointer-events-none absolute inset-0 z-[4] opacity-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.18), transparent)',
            }}
          />
        </div>

        {/* text */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="hidden flex-wrap items-center gap-2.5 text-xl font-bold text-white md:flex">
            {name}
            <span className="proj-arrow text-accent-2">↗</span>
            {featuredLabel && <FeaturedTag label={featuredLabel} />}
            {status && <StatusTag {...status} />}
          </div>
          <p className="text-muted hidden text-sm md:block">{summary}</p>
          <p className="text-muted text-sm leading-relaxed md:hidden">{description}</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {stack.map((s) => (
              <li
                key={s}
                className="border-border rounded-full border px-2.5 py-1 font-mono text-[11px] text-[#a9a7bd]"
              >
                {s}
              </li>
            ))}
          </ul>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white md:hidden">
            {viewLabel} <span className="proj-arrow text-accent-2">↗</span>
          </span>
        </div>

        <ProjectVisual name={name} />
      </a>
    </div>
  );
}
