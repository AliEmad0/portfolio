'use client';

import { useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocaleDir } from '@/hooks/useLocaleDir';
import { Magnetic } from '@/animation/Magnetic';

export type HeroSocial = { label: string; url: string; icon: string };

type HeroProps = {
  name: string;
  role: string;
  tagline: string;
  tags: string[];
  socials: HeroSocial[];
  resumeUrl: string;
};

const ICONS: Record<string, ReactNode> = {
  github: (
    <path d="M12 .5A11.5 11.5 0 0 0 8.4 22.9c.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
  ),
  linkedin: (
    <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21H21v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9V9Z" />
  ),
  mail: (
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7L4 7v1l8 5 8-5V7l-8 5Z" />
  ),
};

export function Hero({ name, role, tagline, tags, socials, resumeUrl }: HeroProps) {
  const t = useTranslations();
  const { sign } = useLocaleDir();
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // The name cascades one animated unit at a time. Latin splits per character;
  // Arabic is cursive, so per-character spans would break letter-joining — split
  // it per word instead (whitespace kept as its own unit via the capture group).
  const nameUnits = /[؀-ۿ]/.test(name) ? name.split(/(\s+)/) : [...name];

  // Entrance timeline — leak-free via useGSAP scope; skipped under reduced motion.
  useGSAP(
    () => {
      if (reduced) return;
      const root = rootRef.current;
      if (!root) return;
      const letters = root.querySelectorAll('[data-letter]');
      const roleEl = root.querySelector<HTMLElement>('[data-role]');
      const groups = root.querySelectorAll('[data-anim]');
      if (!roleEl) return;

      gsap.set(letters, { yPercent: 120, opacity: 0 });
      gsap.set(groups, { opacity: 0, y: 16 });
      gsap.set(roleEl, { width: 0 });

      const steps = roleEl.textContent?.length ?? 12;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(letters, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.6 }, 0.1)
        .to(roleEl, { width: roleEl.scrollWidth, duration: 1, ease: `steps(${steps})` }, 0.7)
        .to(root.querySelector('[data-anim="tagline"]'), { opacity: 1, y: 0, duration: 0.5 }, 1.3)
        .to(root.querySelector('[data-anim="tags"]'), { opacity: 1, y: 0, duration: 0.5 }, 1.5)
        .to(root.querySelector('[data-anim="cta"]'), { opacity: 1, y: 0, duration: 0.5 }, 1.75)
        .to(root.querySelector('[data-anim="socials"]'), { opacity: 1, y: 0, duration: 0.5 }, 2);
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // Pointer parallax tilt — RTL-aware; skipped under reduced motion.
  useGSAP(
    () => {
      if (reduced) return;
      const stage = stageRef.current;
      const tilt = tiltRef.current;
      if (!stage || !tilt) return;
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.5, ease: 'power3' });
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.5, ease: 'power3' });
      const onMove = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 12 * sign);
        rx(-py * 8);
      };
      const onLeave = () => {
        ry(0);
        rx(0);
      };
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
      return () => {
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
      };
    },
    { scope: rootRef, dependencies: [reduced, sign] },
  );

  return (
    <section ref={rootRef} id="home" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-60 blur-[80px]"
        style={{
          background: 'radial-gradient(closest-side, rgba(124,92,255,0.30), transparent 70%)',
        }}
      />
      <div
        ref={stageRef}
        className="relative mx-auto flex min-h-[86svh] max-w-6xl items-center px-6"
        style={{ perspective: '900px' }}
      >
        <div
          ref={tiltRef}
          className="flex flex-col items-start"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <p
            className="text-accent mb-4 font-mono text-xs tracking-[0.28em] uppercase"
            style={{ transform: 'translateZ(18px)' }}
          >
            {t('hero.kicker')} — {role}
          </p>

          <h1
            className="m-0 flex flex-wrap text-5xl leading-[0.98] font-bold tracking-tight text-white sm:text-7xl"
            style={{ transform: 'translateZ(46px)' }}
          >
            {nameUnits.map((unit, i) => (
              <span key={i} data-letter className="inline-block whitespace-pre">
                {unit.trim() === '' ? '\u00A0' : unit}
              </span>
            ))}
          </h1>

          <div
            className="mt-4 text-lg font-medium text-[#c8c3e6]"
            style={{ transform: 'translateZ(32px)' }}
          >
            <span
              data-role
              className="hero-caret inline-block overflow-hidden pe-0.5 align-bottom whitespace-nowrap"
            >
              {role}
            </span>
          </div>

          <p
            data-anim="tagline"
            className="text-muted mt-4 max-w-xl text-sm leading-relaxed"
            style={{ transform: 'translateZ(16px)' }}
          >
            {tagline}
          </p>

          <ul
            data-anim="tags"
            className="mt-5 flex list-none flex-wrap gap-2 p-0"
            style={{ transform: 'translateZ(20px)' }}
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className="border-border rounded-full border px-3 py-1 font-mono text-xs text-[#a9a7bd]"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div
            data-anim="cta"
            className="mt-6 flex gap-3"
            style={{ transform: 'translateZ(34px)' }}
          >
            <Magnetic strength={0.35}>
              <a
                href="#projects"
                data-cursor
                className="hero-ring bg-accent block rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                {t('actions.viewWork')}
              </a>
            </Magnetic>
            <a
              href="#contact"
              data-cursor
              className="hover:border-accent rounded-xl border border-[#3a3a48] px-5 py-3 text-sm font-semibold text-[#cfcfe0] transition-colors"
            >
              {t('actions.getInTouch')}
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor
              className="hover:border-accent inline-flex items-center gap-2 rounded-xl border border-[#3a3a48] px-5 py-3 text-sm font-semibold text-[#cfcfe0] transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
              </svg>
              {t('actions.viewResume')}
            </a>
          </div>

          <ul
            data-anim="socials"
            className="mt-6 flex list-none gap-2.5 p-0"
            style={{ transform: 'translateZ(24px)' }}
          >
            {socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  aria-label={s.label}
                  target={s.url.startsWith('http') ? '_blank' : undefined}
                  rel={s.url.startsWith('http') ? 'noreferrer' : undefined}
                  className="hover:border-accent flex h-10 w-10 items-center justify-center rounded-xl border border-[#2f2f3a] text-[#a2a2b0] transition-all hover:-translate-y-0.5 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden>
                    {ICONS[s.icon] ?? ICONS.mail}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
