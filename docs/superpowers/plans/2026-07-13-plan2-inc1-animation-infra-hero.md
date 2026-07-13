# Plan 2 · Increment 1 — Animation Infrastructure + Hero

> Executed inline (section-by-section flow). Steps are checkboxes.

**Goal:** Stand up the shared animation layer (GSAP + `useGSAP`, Motion, Lenis smooth-scroll, reduced-motion gate, RTL-aware direction) and build the real Hero section with the owner-approved composed animation (name cascade → typewriter role → tagline → tech tags → CTAs → socials → pulsing ring, inside a pointer-parallax 3D tilt).

**Environment:** WSL wrapper for all pnpm/node (see repo README). Commit footer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Files

- `src/hooks/useReducedMotion.ts` (+ test) — subscribes to `prefers-reduced-motion`.
- `src/hooks/useLocaleDir.ts` (+ test) — maps locale → `'ltr' | 'rtl'` and a `±1` sign for x-motion.
- `src/animation/SmoothScroll.tsx` — Lenis provider, disabled under reduced motion; RAF-driven.
- `src/components/sections/Hero.tsx` — client hero; GSAP entrance timeline via `useGSAP` (auto-revert), pointer tilt via `gsap.quickTo`, CSS caret + ring.
- `src/styles/globals.css` — add `@keyframes` for the caret blink + ring pulse (reduced-motion gated).
- `src/app/[locale]/page.tsx` — render `<Hero/>`.
- `src/app/[locale]/layout.tsx` — wrap children in `<SmoothScroll>`.
- `content/portfolio.json` — update `profile.tagline` (en + ar) to the approved copy.

## Tasks

1. **Content** — update tagline in `portfolio.json` (en: "Specialized in engineering immersive, accessible, and ultra-fast web applications that feel alive."; ar equivalent). Schema test still passes.
2. **useReducedMotion** — TDD hook (returns boolean; reacts to matchMedia). Test with a mocked `matchMedia`.
3. **useLocaleDir** — TDD helper: `dirFor(locale)` → `'rtl'|'ltr'`, `signFor(locale)` → `1|-1`.
4. **SmoothScroll** — Lenis provider; no smoothing under reduced motion; cleaned up on unmount.
5. **Hero** — build the component + render test (name, role, tagline, CTAs, socials, tags present in DOM regardless of JS). Wire GSAP entrance + tilt, gated by reduced motion, RTL-aware.
6. **Wire** — Hero into the home page; SmoothScroll into the layout; hero keyframes into globals.
7. **Verify** — `type-check` + `lint` + `test` + `build`; live server: `/` shows the hero (English), `/ar` mirrors RTL; content present with JS off (SSR).
8. **Ship** — commit → PR → auto-merge on green CI.

## Notes

- **No CLS / no FOUC:** content renders visible in SSR; `useGSAP` runs in a layout effect and applies the hidden `from`-state before paint. Reduced motion → no animation, content stays visible.
- **Leak-free:** all GSAP lives in `useGSAP(..., { scope })` which reverts tweens + listeners on unmount.
- **Tech tags + socials are data-driven** from `portfolio.json` (skills items + socials + email).
