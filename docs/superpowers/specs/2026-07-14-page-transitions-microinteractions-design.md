# Page transitions + micro-interactions — design

**Date:** 2026-07-14
**Branch:** `feat/page-transitions-microinteractions`
**Status:** approved (design), pending implementation

## Goal

Tie the five existing sections into one cohesive, "alive" feel by adding: a smooth
locale (EN↔AR) transition, a polished first-load entrance, smooth in-page navigation
with an active-section indicator, subtle-premium micro-interactions, and a custom
cursor. Everything reduced-motion-safe, RTL-correct, SSR-visible, and consistent with
the existing GSAP + Lenis stack.

## Scope (confirmed with Ali, 2026-07-14)

- **Transitions:** "Core + scroll polish" — locale-switch crossfade, first-load
  entrance, smooth anchor scrolling, active-section nav highlight. **No** intro loader.
- **Micro-interactions:** "Subtle & premium" — refined hover/press/focus, one magnetic
  primary CTA, animated link underline, card hover-lift. No tilt-everything.
- **Custom cursor:** Yes — desktop `pointer: fine` only; disabled on touch and reduced-motion.

Out of scope: intro/curtain loader, Contact section (future Plan 3), any new content.

## Existing patterns to honor

- Motion: `gsap` + `ScrollTrigger` via `@gsap/react` `useGSAP` (leak-free, scoped).
- Smooth scroll: `Lenis` created inside `src/animation/SmoothScroll.tsx` (instance is
  currently private).
- Reduced motion: `useReducedMotion()` hook + a global CSS safety net in `globals.css`
  (`@media (prefers-reduced-motion: reduce)` neutralizes animations/transitions).
- Ongoing CSS loops are gated behind a `.is-live` class added by each section's GSAP entrance.
- Design tokens (globals `@theme`): `--color-accent` `#7c5cff`, `--color-accent-2`
  `#43e6d0`, `--color-accent-3` `#ff7ac2`, plus background/surface/border/muted/foreground.
- Section ids: Hero `#home`; sections `#about`, `#projects`, `#skills`, `#experience`.
  Header nav also lists `contact`, which has no section yet (Plan 3) — handle gracefully.

## Components & changes

### 1. LenisProvider (refactor of SmoothScroll)

`SmoothScroll` hides its Lenis instance. Refactor into a `LenisProvider` that stores the
instance in React context and exposes `useLenis()`. Behavior identical (duration 1.1,
smoothWheel, GSAP ticker sync, disabled under reduced-motion; returns `null` instance then).
Consumers: the smooth-scroll nav and the custom cursor. **What it does:** provides the shared
scroll engine. **Interface:** `<LenisProvider>{children}</LenisProvider>` + `useLenis(): Lenis | null`.
**Depends on:** `lenis`, `gsap`, `useReducedMotion`.

### 2. Locale-switch transition (View Transitions API)

Wrap the locale navigation in `document.startViewTransition()` when supported; otherwise
navigate directly. Implemented in `LocaleSwitcher`: intercept click, call
`router.replace(pathname, { locale: target })` inside the transition callback. Crossfade
styled via `::view-transition-old/new(root)` in globals. Under reduced-motion (or no API
support) it's an instant swap. **What it does:** removes the hard flash when switching
language. **Depends on:** next-intl `useRouter`, browser View Transitions (progressive).

### 3. First-load entrance (PageEntrance)

A client wrapper mounted in the layout around `main`. On mount (once), a short GSAP tween
fades/rises the shell (header + main) from `opacity:0, y:8` to rest, ~0.5s. Tuned to NOT
fight Hero's own letter cascade (Hero already animates its internals; the shell entrance is
a whole-page settle, kept subtle and fast). To avoid an SSR flash-of-hidden-content, the
initial hidden state is applied by GSAP on mount only (content is visible by default in
markup); under reduced-motion the effect is skipped entirely. **What it does:** a graceful
whole-page arrival. **Depends on:** `gsap`, `useGSAP`, `useReducedMotion`.

### 4. Interactive Nav (extract from Header) + useActiveSection

`Header` is an async server component. Extract the `<nav>` into a client `Nav.tsx` that
receives `{ items: {id,label}[] }`:

- Anchor click → `preventDefault`, smooth-scroll to the section via `useLenis().scrollTo(target, { offset })`
  accounting for the sticky header height; falls back to `el.scrollIntoView()` when Lenis is null
  (reduced motion) and updates the hash.
- `useActiveSection(ids)` uses an `IntersectionObserver` (no motion) to track the section in
  view; the active nav item gets an accent underline/foreground color. Sections not present
  in the DOM (e.g. `contact`) are simply never active.
  Header stays a server component and renders `<Nav items=… />`. **What it does:** in-page
  navigation that feels smooth and shows where you are. **Depends on:** `useLenis`, IntersectionObserver.

### 5. Micro-interactions (subtle & premium)

- `Magnetic.tsx`: a reusable client wrapper. On `pointermove` within a radius it translates
  its child toward the pointer via `gsap.quickTo` (small, e.g. ±6px), springs back on leave.
  Applied to the Hero primary CTA ("View work"). Disabled under reduced-motion / coarse pointer.
- Animated underline: a `.link-underline` utility (CSS) — an accent underline that grows from
  the inline-start on hover/focus-visible (RTL-correct via logical properties). Applied to nav
  items and social/footer links.
- Card hover-lift: `ProjectRow` cards get a subtle `-translate-y` + border-accent + shadow on
  hover (CSS transition; already partially present — make consistent).
- Global press/focus: unified `:active` scale-down (~0.98) on buttons and a visible
  `:focus-visible` accent ring, added in globals.

### 6. Custom cursor (CustomCursor)

Client component mounted in layout. A fixed dot + trailing ring that lerp toward the pointer
(`gsap.quickTo`). Renders `null` unless `matchMedia('(pointer: fine)').matches` AND not
reduced-motion. Over elements marked `[data-cursor]` (or native interactive: a, button) the
ring grows and can show a short label via `data-cursor-label`. Native cursor is hidden only
while the custom cursor is active (`body.has-custom-cursor { cursor: none }`), restored
otherwise so touch/keyboard users are unaffected. **What it does:** a premium pointer accent.
**Depends on:** `gsap`, `useReducedMotion`, matchMedia.

### 7. Consistency fix

Update the stale `metadata` in `src/app/[locale]/layout.tsx` (title/description) from
"Frontend Engineer" to the confirmed "Senior Front-End Developer".

## Data flow

Layout (server) → `LenisProvider` (client, provides Lenis) → `CustomCursor` + `PageEntrance`

- `Header`(server, renders client `Nav`) + `main`. `Nav` and `CustomCursor` read Lenis via
  `useLenis()`. All motion consults `useReducedMotion()`. No new content/data; nothing touches
  `portfolio.json` schema.

## Error handling & edge cases

- View Transitions unsupported → plain navigation (feature-detected).
- Lenis null (reduced motion) → nav falls back to `scrollIntoView`.
- Touch / coarse pointer → no custom cursor, no magnetic effect; native cursor untouched.
- `#contact` target absent → nav item never active; clicking scrolls to nothing gracefully
  (guard: only handle click when the target element exists, else allow default).
- SSR: all interactive pieces are client components; markup renders visible content so there
  is no flash-of-hidden-content and no hydration mismatch.

## Testing (Vitest + Testing Library, matching existing tests)

- `useActiveSection`: observing → sets active id; unobserving cleans up. (Mock IntersectionObserver.)
- `LenisProvider`/`useLenis`: returns `null` under reduced motion; provider renders children.
- `CustomCursor`: renders `null` under reduced-motion and under coarse pointer (mock matchMedia).
- `Nav`: renders items; click on an existing target calls scroll (Lenis mock) and preventDefault;
  falls back when Lenis null.
- Existing suite must stay green (17 tests).

## Accessibility

- Everything gated on `prefers-reduced-motion` (hook + CSS net).
- Custom cursor never replaces focus/keyboard affordances; `:focus-visible` ring added.
- Underline/active states use color **and** underline (not color alone).
- RTL: logical properties throughout; magnetic/cursor math is direction-agnostic (pointer-based).

## Rollout

Single feature branch → one PR (`feat/page-transitions-microinteractions`), matching the
per-section PR cadence. Verify with `pnpm test` + a manual run of the dev server (drive the
locale switch, nav scroll, hover states, and reduced-motion emulation).
