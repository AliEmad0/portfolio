# Portfolio — Ali Emad

A modern, animated, bilingual (English + Arabic RTL) developer portfolio.

- **Framework:** Next.js (App Router, RSC-first) · TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS `@theme`, dark-premium theme)
- **i18n:** next-intl — English (unprefixed) + Arabic (`/ar/*`, full RTL)
- **Animation (Plan 2+):** GSAP + ScrollTrigger (`useGSAP`), Motion, Lenis
- **Contact (Plan 3):** Resend via a server action
- **Testing:** Vitest (unit) + Playwright (E2E, Plan 5)

## Environment / running commands

The repo lives on the WSL Ubuntu filesystem. When launched from Windows the working
directory is a UNC path, and **any Node command (`pnpm`, `npx`, `node`) must run through
WSL** (a UNC cwd breaks tools that spawn `cmd.exe`):

```bash
wsl -d Ubuntu -- bash -c 'source $HOME/.nvm/nvm.sh && nvm use 22 >/dev/null && cd /home/aliemad/projects/portfolio && pnpm <command>'
```

> A Husky pre-commit hook runs lint-staged. If it fails because Node isn't on PATH in a
> Windows git context, commit from the WSL shell (with nvm sourced) instead.

## Scripts

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Dev server (Turbopack, port 3000)   |
| `pnpm build`      | Production build (also type-checks) |
| `pnpm start`      | Serve the production build          |
| `pnpm type-check` | `tsc --noEmit`                      |
| `pnpm lint`       | ESLint                              |
| `pnpm test`       | Vitest, single pass                 |
| `pnpm format`     | Prettier write                      |

## Data model

All portfolio **content** lives in a single validated file:

- **`content/portfolio.json`** — profile, socials, skills, projects, timeline. Localizable
  prose fields are `{ "en": "...", "ar": "..." }` objects. Validated against a Zod schema
  (`src/lib/schema.ts`) at import time — malformed content fails the build and tests.
- **`src/lib/content.ts`** — typed loader + `localized(field, locale)` helper.
- **`content/GAPS.md`** — checklist of content still to confirm/fill.

UI **chrome strings** (nav, buttons, form labels) live separately in next-intl message
files: `messages/en.json`, `messages/ar.json`.

## i18n / RTL

`localePrefix: 'as-needed'` — English is unprefixed, Arabic is under `/ar/*`. The `[locale]`
layout sets `<html lang dir>` (`rtl` for Arabic). Use Tailwind logical properties
(`ps/pe/ms/me`, `start/end`) so layout mirrors automatically.

## Roadmap

Built in 5 sequential plans (see `docs/superpowers/plans/`):

1. **Foundation** _(this plan)_ — scaffold, data layer, i18n/RTL, theme, chrome, CI.
2. Animation infrastructure + core sections (Hero/About/Projects/Skills/Timeline).
3. Contact form (Resend).
4. Blog (MDX).
5. Perf/SEO/a11y hardening + full E2E + deploy.
