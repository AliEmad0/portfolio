# Developer Portfolio — Design Spec

**Date:** 2026-07-13
**Owner:** Ali Emad (sonnythedeveloper@gmail.com)
**Status:** Approved design → ready for implementation planning
**Location:** `~/projects/portfolio` (fresh standalone repo, sibling to `pitchiq`)

---

## 1. Goal

A highly modern, visually stunning, performance-optimized **personal developer portfolio** intended to impress top-tier tech companies through both advanced interactive animation and pristine architectural code quality. It showcases Ali Emad's real work (PitchIQ front-and-center), experience, and skills, in **English and Arabic (full RTL)**.

Success criteria:

- Near-perfect Lighthouse across **Performance, SEO, Accessibility, Best Practices**.
- **CLS ≈ 0** — animations never cause layout shift.
- **No GSAP memory leaks** — all scroll/timeline instances auto-revert on unmount, enforced structurally.
- All personal content editable from **one validated JSON file**.
- Clean, scalable, strictly-typed architecture with clear module boundaries.

---

## 2. Tech Stack (locked)

| Concern                          | Choice                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Framework                        | Next.js (App Router, RSC-first)                                                                          |
| Language                         | TypeScript (strict + extra strictness flags)                                                             |
| Styling                          | Tailwind CSS v4 (CSS-based `@theme`, no `tailwind.config.ts`)                                            |
| Scroll animation                 | **GSAP + ScrollTrigger** via `@gsap/react` `useGSAP()`                                                   |
| Micro-interactions & transitions | **Motion** (Framer Motion, `motion/react`)                                                               |
| Smooth scroll                    | **Lenis** (reduced-motion gated)                                                                         |
| i18n                             | **next-intl** — EN (unprefixed) + AR (`/ar/*`, full RTL), `localePrefix: 'as-needed'`                    |
| Fonts                            | `next/font` (self-hosted) — Latin display/body + Arabic-capable face (e.g. IBM Plex Sans Arabic / Cairo) |
| Contact delivery                 | **Resend** via a Next.js server action                                                                   |
| Blog                             | **MDX** content pipeline                                                                                 |
| SEO                              | Metadata API, `sitemap.ts`, `robots.ts`, dynamic OG images, **JSON-LD `Person`**                         |
| Analytics                        | Vercel Analytics + Speed Insights                                                                        |
| Deploy                           | Vercel                                                                                                   |
| Package manager                  | pnpm                                                                                                     |
| Testing                          | **Full** — Vitest (unit) + Playwright (E2E + axe a11y) + CI                                              |
| Theme                            | **Dark only** (premium dark aesthetic; no light theme by choice — YAGNI)                                 |

**Aesthetic direction:** Dark & premium — deep dark canvas, glassmorphism, subtle gradients/glow, refined typography, cinematic scroll moments. Concrete motion designs will be chosen from a live animated gallery before any animation is implemented (standing owner rule).

---

## 3. Data Layer — single validated source of truth

- **`content/portfolio.json`** holds ALL portfolio content: profile, projects, skills, experience timeline, socials/contact.
- Localizable prose fields are objects: `{ "en": "...", "ar": "..." }` — one file carries both languages.
- **`src/lib/schema.ts`** — a Zod schema validates the JSON at import/build time. Missing/malformed fields fail loudly. TypeScript types are **inferred from the schema** (`src/types` re-exports them).
- **`src/lib/content.ts`** — typed loader: parses + validates `portfolio.json` once, exposes typed accessors + a `localized(field, locale)` helper.
- **UI chrome strings** (nav, buttons, form labels/errors, "Read more", locale/section labels) live in **next-intl** message files `messages/en.json` + `messages/ar.json` — NOT in `portfolio.json`.

**Boundary:** `portfolio.json` = _your content_. `messages/*.json` = _interface strings_. Blog posts = MDX files (own front-matter).

---

## 4. Animation Architecture

**Ownership boundary (no two systems animate the same property on the same element):**

- **GSAP + ScrollTrigger** — scroll-driven mechanics only: pinned experience timeline, parallax, scroll-reveal sequences.
  - Every GSAP usage goes through **`useGSAP()` from `@gsap/react`**, scoped to a container ref. This reverts all tweens **and** ScrollTriggers created in scope on unmount → structural memory-leak prevention (no hand-written `.kill()`).
  - **`src/animation/GsapProvider.tsx`** (client) registers plugins exactly once.
  - Reusable scoped hooks: `useScrollReveal`, `useParallax`, `usePinnedTimeline`.
- **Motion (Framer Motion)** — micro-interactions (hover/tap/focus), section enter/exit, and **route/page transitions** via `app/[locale]/template.tsx` + `AnimatePresence`.
- **Lenis** — smooth scroll, wired to ScrollTrigger's scroll proxy; disabled under reduced motion.

**Reduced motion:** a global gate — `useReducedMotion` hook (React) + CSS `@media (prefers-reduced-motion: reduce)` — disables Lenis, collapses reveals/parallax to instant, and neutralizes Motion variants. Same discipline as PitchIQ.

**RTL-aware motion:** `useLocaleDir` supplies direction; GSAP x-translations flip sign for Arabic so parallax/reveals move the correct way.

---

## 5. Performance / Lighthouse / CLS strategy

- **RSC-first**: Server Components everywhere except `"use client"` islands that need interactivity/animation → minimal client JS.
- **CLS ≈ 0 by construction**: animate `transform`/`opacity` only; reserve space for animated blocks; `next/font` (no swap shift); `next/image` with explicit dimensions; ScrollTrigger `markers` off in prod; no layout-affecting animated props.
- **Loading**: dynamic import of heavy client-only libs inside islands; lazy-load below-the-fold; route prefetch.
- **SEO**: Metadata API per route, `sitemap.ts`, `robots.ts`, `manifest.ts`, dynamic OG images, JSON-LD `Person` schema, hreflang for en/ar.
- **A11y**: semantic landmarks, focus management across route transitions, visible focus, color-contrast in dark theme, `prefers-reduced-motion` honored, keyboard-operable everything, axe checks in E2E.

---

## 6. i18n / RTL

- next-intl with `[locale]` route segment + `middleware.ts` for locale routing; `setRequestLocale` to preserve SSG.
- `localePrefix: 'as-needed'` — EN unprefixed, `/ar/*` for Arabic (matches PitchIQ convention).
- `<html lang dir>` set per locale; `dir="rtl"` for Arabic.
- Tailwind **logical properties** (`ps/pe/ms/me`, `start/end`) so layout mirrors for free.
- Arabic-capable font loaded via `next/font` with the arabic subset.

---

## 7. Sections & Routes

Home (`/` and `/ar`) composes: **Hero → About → Projects (with case-study detail) → Skills → Experience timeline → Contact form**, plus a footer with contact links.

- **Hero + About** — animated landing (name, role, tagline, CTA) + bio; signature scroll moment.
- **Projects** — featured work (PitchIQ first) with case-study detail: stack, role, highlights, links, images.
- **Skills** — categorized stack with tasteful animated presentation (not generic bars).
- **Experience timeline** — scroll-driven, GSAP ScrollTrigger **pinning** showcase.
- **Contact form** — validated form → Resend server action → email to Ali; spam protection (honeypot + basic rate limit); success/error states. Contact links (email/LinkedIn/GitHub) always present.
- **Blog** — MDX articles at `/blog` + `/blog/[slug]`; front-matter driven; localized where practical. Lands last (largest add).

---

## 8. Directory Tree

```
portfolio/
├── content/portfolio.json            # single source of truth (Zod-validated)
├── messages/{en,ar}.json             # UI strings
├── public/                           # images, resume PDF, og assets
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx            # html dir, fonts, providers, metadata
│   │   │   ├── template.tsx          # Motion page transitions
│   │   │   ├── page.tsx              # home (composes sections)
│   │   │   └── blog/{page.tsx,[slug]/page.tsx}
│   │   ├── api/og/…                  # dynamic OG images
│   │   ├── sitemap.ts · robots.ts · manifest.ts
│   ├── components/{sections,ui,layout}/
│   ├── animation/{GsapProvider.tsx,useScrollReveal.ts,useParallax.ts,usePinnedTimeline.ts,Lenis}
│   ├── hooks/{useReducedMotion,useLocaleDir,…}
│   ├── lib/{schema.ts,content.ts,seo.ts,contact.ts}
│   ├── i18n/                         # next-intl config + routing
│   ├── context/                      # theme/dir context if needed
│   ├── types/                        # types inferred from Zod
│   └── styles/globals.css            # Tailwind v4 @theme, tokens, reduced-motion
├── tests/{unit,e2e}/
├── middleware.ts                     # next-intl locale routing
├── tsconfig.json                     # strict + @/* paths
└── eslint · prettier · husky · lint-staged · CI (GitHub Actions)
```

---

## 9. Testing

- **Vitest (unit):** `portfolio.json` validates against Zod; `content.ts` localized accessors; `useReducedMotion`/`useLocaleDir` logic; component render smoke tests.
- **Playwright (E2E):** home loads; all sections present; locale switch EN↔AR flips `dir` + content; reduced-motion path renders without animation; contact-form validation + happy path (Resend mocked); **axe** a11y pass on key routes.
- **CI:** GitHub Actions — type-check, lint, unit, build, E2E.

---

## 10. Environment / Secrets

- `RESEND_API_KEY` — server-only, for contact form.
- `CONTACT_TO_EMAIL` — destination address.
- `NEXT_PUBLIC_SITE_URL` — canonical URL for metadata/OG/sitemap.
- (Vercel Analytics/Speed Insights need no keys.)
- `.env.example` documents all of the above.

---

## 11. Implementation Phases (expanded into tasks in the plan)

0. **Scaffold & tooling** — Next.js App Router, TS strict + `@/*` paths, Tailwind v4, ESLint/Prettier, Husky + lint-staged, pnpm, CI skeleton.
1. **Data layer** — Zod schema + `portfolio.json` (real content, gaps flagged) + typed loader + unit tests.
2. **i18n + RTL foundation** — next-intl, middleware, `[locale]`, fonts (Latin+Arabic), dark theme tokens, layout shell (Header/Footer/LocaleSwitcher).
3. **Animation infrastructure** — GsapProvider, `useGSAP` scoped hooks, Motion setup, Lenis, reduced-motion gate, page transitions.
4. **Core sections** — Hero, About, Projects (+ case-study detail), Skills.
5. **Experience timeline** — ScrollTrigger pinning showcase.
6. **Contact form** — Resend server action + validation + spam protection + states.
7. **Blog** — MDX pipeline + routes.
8. **Perf / SEO / a11y hardening** — Lighthouse pass, Metadata/OG/JSON-LD/sitemap/robots, Analytics, CLS/a11y audits.
9. **Testing + CI + deploy** — full E2E + axe, green CI, Vercel deploy.

**Sequencing note:** the core portfolio (phases 0–5, 8, 9) can ship first; Contact form (6) and Blog (7) can follow without blocking a deployable v1.

---

## 12. Open items for Ali to fill during Phase 1

- Confirmed project list beyond PitchIQ (names, stacks, roles, links, images).
- Experience timeline entries (roles/dates/orgs) — real history.
- Skill categorization + proficiency framing.
- Resume PDF + profile/OG imagery.
- Arabic translations for any content not machine-translatable with confidence.
- Exact repo name / Vercel project name / custom domain (if any).

```

```
