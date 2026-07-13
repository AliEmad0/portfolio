# Portfolio Foundation Implementation Plan (Plan 1 of 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable, strictly-typed, bilingual (EN + Arabic RTL) Next.js shell whose content comes from one Zod-validated JSON file, with dark-premium theming, fonts, layout chrome, and the Vitest test harness in place.

**Architecture:** Next.js App Router (RSC-first) with a `[locale]` segment driven by next-intl. All portfolio content lives in one validated `content/portfolio.json`; a typed loader (`src/lib/content.ts`) parses it once against a Zod schema and exposes localized accessors. UI chrome strings live in next-intl message files. Tailwind v4 (CSS `@theme`) provides dark-only design tokens. This plan deliberately contains **no animation** — that is Plan 2.

**Tech Stack:** Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · next-intl · Zod · Vitest · next/font · pnpm

---

## Environment (read first)

The repo lives on the WSL Ubuntu filesystem (`/home/aliemad/projects/portfolio`) but the tools are launched from Windows on a UNC path. **Any command that spawns Node (`pnpm`, `npx`, `node`) MUST run through WSL**, sourcing nvm for Node 22. Throughout this plan, whenever a step says `RUN (node):`, execute it via this wrapper:

```bash
wsl -d Ubuntu -- bash -c 'source $HOME/.nvm/nvm.sh && nvm use 22 >/dev/null && cd /home/aliemad/projects/portfolio && <THE COMMAND>'
```

Plain `git`, file reads/writes, and edits work directly on the UNC path (they don't spawn `cmd.exe`). Git identity is already configured locally (`Ali Emad` / `sonnythedeveloper@gmail.com`). There are no Husky hooks yet (added in Task 4); until then commits run plain.

Commit message footer for every commit in this plan:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

## File Structure (created by this plan)

- `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` — toolchain (Task 1–2)
- `.eslintrc` / `eslint.config.mjs`, `.prettierrc`, `.husky/`, `lint-staged` config — quality gates (Task 3–4)
- `vitest.config.ts`, `tests/setup.ts` — unit test harness (Task 5)
- `src/lib/schema.ts` — Zod schema + inferred types for portfolio content (Task 6)
- `content/portfolio.json` — the single content source of truth (Task 7)
- `src/lib/content.ts` — typed loader + `localized()` helper (Task 8)
- `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`, `middleware.ts` — next-intl (Task 9)
- `messages/en.json`, `messages/ar.json` — UI chrome strings (Task 9)
- `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` — bilingual shell (Task 10)
- `src/styles/globals.css` — Tailwind v4 `@theme` dark tokens (Task 11)
- `src/components/layout/{Header,Footer,LocaleSwitcher}.tsx` — chrome (Task 12)
- `.github/workflows/ci.yml` — CI (Task 13)
- `.env.example`, `README.md` — docs (Task 14)

---

## Task 1: Scaffold the Next.js app

**Files:** Creates the whole toolchain into the existing repo (which currently holds only `.git/` and `docs/`).

- [ ] **Step 1: Scaffold with create-next-app**

RUN (node):

```
pnpm create next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --turbopack --use-pnpm
```

When prompted about existing files (`docs/`), choose to continue — create-next-app only conflicts on files it generates, and `docs/` is untouched.

- [ ] **Step 2: Verify it builds and the dev harness runs**

RUN (node): `pnpm build`
Expected: build completes with a default home route.

- [ ] **Step 3: Move the default global stylesheet to the planned location**

Move `src/app/globals.css` → `src/styles/globals.css` and update its import in `src/app/layout.tsx` (this default layout will be replaced in Task 10; the move just fixes the path now). If create-next-app placed it at `src/app/globals.css`, leaving it is acceptable — but the plan assumes `src/styles/globals.css`; standardize now.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "chore: scaffold Next.js app (App Router, TS, Tailwind v4, pnpm)"
```

---

## Task 2: Strict TypeScript + absolute imports

**Files:**

- Modify: `tsconfig.json`

- [ ] **Step 1: Tighten compiler options**

Ensure `compilerOptions` includes (merge with what create-next-app generated; keep its `paths`, `plugins`, `moduleResolution`):

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
  },
}
```

- [ ] **Step 2: Verify type-check passes on the scaffold**

RUN (node): `pnpm exec tsc --noEmit`
Expected: no errors (fix any `noUnusedParameters` complaints in scaffolded files by prefixing unused args with `_`).

- [ ] **Step 3: Add convenience scripts**

In `package.json` `scripts`, ensure these exist:

```json
"type-check": "tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Commit**

```
git add tsconfig.json package.json
git commit -m "chore(ts): strict compiler options + @/* absolute imports"
```

---

## Task 3: Prettier

**Files:**

- Create: `.prettierrc`, `.prettierignore`

- [ ] **Step 1: Install Prettier + Tailwind plugin**

RUN (node): `pnpm add -D prettier prettier-plugin-tailwindcss`

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
.next
node_modules
pnpm-lock.yaml
content/portfolio.json
```

- [ ] **Step 4: Add format scripts and run once**

Add to `package.json` scripts: `"format": "prettier --write ."` and `"format:check": "prettier --check ."`
RUN (node): `pnpm format`
Expected: files reformatted, no errors.

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "chore: prettier + tailwind class sorting"
```

---

## Task 4: Husky + lint-staged

**Files:**

- Create: `.husky/pre-commit`
- Modify: `package.json`

- [ ] **Step 1: Install**

RUN (node): `pnpm add -D husky lint-staged && pnpm exec husky init`

- [ ] **Step 2: Configure lint-staged in `package.json`**

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx,css,md,json}": "prettier --write",
  "*.{ts,tsx}": "eslint --fix --max-warnings=0"
}
```

- [ ] **Step 3: Set the pre-commit hook**

Replace `.husky/pre-commit` contents with:

```sh
pnpm exec lint-staged
```

- [ ] **Step 4: Verify the hook fires**

Make a trivial whitespace edit to `README.md` (create it if absent), `git add` it, and `git commit -m "chore: verify husky"`.
Expected: lint-staged runs before the commit completes.

> Note: if the hook fails because Node isn't on PATH in the git GUI context, commits from the WSL shell work; document this in README (Task 14).

- [ ] **Step 5: Commit** (already done in Step 4 if the hook passed; otherwise commit the config)

```
git add -A
git commit -m "chore: husky pre-commit + lint-staged"
```

---

## Task 5: Vitest harness

**Files:**

- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/unit/harness.test.ts`

- [ ] **Step 1: Install**

RUN (node): `pnpm add -D vitest @vitejs/plugin-react happy-dom @testing-library/react @testing-library/jest-dom`

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write the failing harness test**

`tests/unit/harness.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs and resolves the @ alias environment', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the tests**

RUN (node): `pnpm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "test: vitest harness (happy-dom + testing-library)"
```

---

## Task 6: Zod content schema

**Files:**

- Create: `src/lib/schema.ts`, `tests/unit/schema.test.ts`

- [ ] **Step 1: Install Zod**

RUN (node): `pnpm add zod`

- [ ] **Step 2: Write the failing schema test**

`tests/unit/schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { portfolioSchema } from '@/lib/schema';

const valid = {
  profile: {
    name: 'Ali Emad',
    role: { en: 'Frontend Engineer', ar: 'مهندس واجهات أمامية' },
    tagline: { en: 'I build fast, beautiful web apps.', ar: 'أبني تطبيقات ويب سريعة وجميلة.' },
    location: { en: 'Egypt', ar: 'مصر' },
    email: 'sonnythedeveloper@gmail.com',
    resumeUrl: '/resume.pdf',
  },
  socials: [{ label: 'GitHub', url: 'https://github.com/AliEmad0', icon: 'github' }],
  skills: [
    {
      category: { en: 'Frontend', ar: 'الواجهة الأمامية' },
      items: ['React', 'Next.js', 'TypeScript'],
    },
  ],
  projects: [
    {
      slug: 'pitchiq',
      name: 'PitchIQ',
      summary: { en: 'A Premier League encyclopedia.', ar: 'موسوعة الدوري الإنجليزي.' },
      description: { en: '34 seasons of data.', ar: '٣٤ موسمًا من البيانات.' },
      stack: ['Next.js', 'TypeScript', 'Tailwind'],
      role: { en: 'Solo developer', ar: 'مطوّر منفرد' },
      highlights: [{ en: '1170 tests', ar: '١١٧٠ اختبارًا' }],
      links: [{ label: 'Live', url: 'https://pitchiq-pl.vercel.app' }],
      image: '/projects/pitchiq.png',
      featured: true,
    },
  ],
  timeline: [
    {
      start: '2023',
      end: 'present',
      title: { en: 'Frontend Engineer', ar: 'مهندس واجهات' },
      org: { en: 'Freelance', ar: 'عمل حر' },
      description: { en: 'Building products.', ar: 'بناء المنتجات.' },
    },
  ],
};

describe('portfolioSchema', () => {
  it('accepts a well-formed portfolio', () => {
    expect(() => portfolioSchema.parse(valid)).not.toThrow();
  });

  it('rejects a localized field missing the Arabic variant', () => {
    const bad = structuredClone(valid);
    // @ts-expect-error intentionally break the shape
    bad.profile.role = { en: 'Frontend Engineer' };
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });

  it('rejects an invalid email', () => {
    const bad = structuredClone(valid);
    bad.profile.email = 'not-an-email';
    expect(() => portfolioSchema.parse(bad)).toThrow();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

RUN (node): `pnpm test tests/unit/schema.test.ts`
Expected: FAIL — cannot find module `@/lib/schema`.

- [ ] **Step 4: Implement the schema**

`src/lib/schema.ts`:

```ts
import { z } from 'zod';

/** A string that must be provided in both supported locales. */
export const localizedString = z.object({
  en: z.string().min(1),
  ar: z.string().min(1),
});
export type LocalizedString = z.infer<typeof localizedString>;

const social = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  icon: z.string().min(1),
});

const skillGroup = z.object({
  category: localizedString,
  items: z.array(z.string().min(1)).min(1),
});

const link = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const project = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: localizedString,
  description: localizedString,
  stack: z.array(z.string().min(1)).min(1),
  role: localizedString,
  highlights: z.array(localizedString).default([]),
  links: z.array(link).default([]),
  image: z.string().min(1),
  featured: z.boolean().default(false),
});

const timelineEntry = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  title: localizedString,
  org: localizedString,
  description: localizedString,
});

export const portfolioSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    role: localizedString,
    tagline: localizedString,
    location: localizedString,
    email: z.string().email(),
    resumeUrl: z.string().min(1),
  }),
  socials: z.array(social).min(1),
  skills: z.array(skillGroup).min(1),
  projects: z.array(project).min(1),
  timeline: z.array(timelineEntry).min(1),
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type Project = z.infer<typeof project>;
export type TimelineEntry = z.infer<typeof timelineEntry>;
export type SkillGroup = z.infer<typeof skillGroup>;
```

- [ ] **Step 5: Run to verify it passes**

RUN (node): `pnpm test tests/unit/schema.test.ts`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "feat(data): zod schema for portfolio content"
```

---

## Task 7: Seed `content/portfolio.json`

**Files:**

- Create: `content/portfolio.json`

- [ ] **Step 1: Write the content file**

Populate with Ali's real data. Below is the seed; fields marked `TODO(ali)` in a sibling `content/GAPS.md` are the ones to confirm (do NOT put TODO strings inside the JSON — it must validate). Use best-known values now; gaps are tracked separately in Step 2.

`content/portfolio.json`:

```json
{
  "profile": {
    "name": "Ali Emad",
    "role": { "en": "Frontend Engineer", "ar": "مهندس واجهات أمامية" },
    "tagline": {
      "en": "I build fast, accessible, beautifully-animated web applications.",
      "ar": "أبني تطبيقات ويب سريعة وسهلة الوصول وذات حركة جميلة."
    },
    "location": { "en": "Egypt", "ar": "مصر" },
    "email": "sonnythedeveloper@gmail.com",
    "resumeUrl": "/resume.pdf"
  },
  "socials": [
    { "label": "GitHub", "url": "https://github.com/AliEmad0", "icon": "github" },
    { "label": "LinkedIn", "url": "https://www.linkedin.com/in/ali-emad", "icon": "linkedin" }
  ],
  "skills": [
    {
      "category": { "en": "Frontend", "ar": "الواجهة الأمامية" },
      "items": ["React", "Next.js", "TypeScript", "Tailwind CSS"]
    },
    {
      "category": { "en": "Animation", "ar": "الحركة" },
      "items": ["GSAP", "Framer Motion", "Lenis"]
    },
    {
      "category": { "en": "Tooling & Quality", "ar": "الأدوات والجودة" },
      "items": ["Vitest", "Playwright", "ESLint", "pnpm"]
    }
  ],
  "projects": [
    {
      "slug": "pitchiq",
      "name": "PitchIQ",
      "summary": {
        "en": "A Premier League encyclopedia spanning 34 seasons.",
        "ar": "موسوعة الدوري الإنجليزي الممتاز تغطي ٣٤ موسمًا."
      },
      "description": {
        "en": "Standings, fixtures, teams, players, managers, a comparison tool, trivia, and an interactive historic map — with a per-era Time-Machine theme, full English/Arabic RTL localization, and motion.",
        "ar": "الترتيب والمباريات والفرق واللاعبون والمدربون وأداة مقارنة ومعلومات وخريطة تاريخية تفاعلية — مع ثيم آلة الزمن لكل حقبة وترجمة كاملة للعربية وحركة."
      },
      "stack": ["Next.js", "TypeScript", "Tailwind CSS", "next-intl", "Zod"],
      "role": { "en": "Solo developer", "ar": "مطوّر منفرد" },
      "highlights": [
        {
          "en": "34 seasons of committed data (1992–2026)",
          "ar": "٣٤ موسمًا من البيانات (١٩٩٢–٢٠٢٦)"
        },
        {
          "en": "Full English + Arabic RTL localization",
          "ar": "ترجمة كاملة للإنجليزية والعربية (من اليمين لليسار)"
        },
        {
          "en": "1170+ unit tests, E2E + CI green",
          "ar": "أكثر من ١١٧٠ اختبار وحدة مع اختبارات شاملة"
        }
      ],
      "links": [{ "label": "Live", "url": "https://pitchiq-pl.vercel.app" }],
      "image": "/projects/pitchiq.png",
      "featured": true
    }
  ],
  "timeline": [
    {
      "start": "2023",
      "end": "present",
      "title": { "en": "Frontend Engineer", "ar": "مهندس واجهات أمامية" },
      "org": { "en": "Independent / Freelance", "ar": "مستقل / عمل حر" },
      "description": {
        "en": "Designing and shipping production web apps end-to-end, including the PitchIQ encyclopedia.",
        "ar": "تصميم وإطلاق تطبيقات ويب إنتاجية بالكامل، بما في ذلك موسوعة PitchIQ."
      }
    }
  ]
}
```

- [ ] **Step 2: Track the gaps to confirm with the owner**

Create `content/GAPS.md` listing what to verify: additional projects (names/stacks/links/images), real timeline entries + dates, LinkedIn URL correctness, resume PDF, project screenshots, skill proficiency framing. This is a checklist, not code.

- [ ] **Step 3: Validate the file against the schema (extend the test)**

Append to `tests/unit/schema.test.ts`:

```ts
import portfolio from '../../content/portfolio.json';

it('the committed content/portfolio.json is valid', () => {
  expect(() => portfolioSchema.parse(portfolio)).not.toThrow();
});
```

Ensure `tsconfig.json` has `"resolveJsonModule": true` (create-next-app enables it; add if missing).

- [ ] **Step 4: Run**

RUN (node): `pnpm test tests/unit/schema.test.ts`
Expected: all passed, including the committed-content case.

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat(data): seed real portfolio content + validation + gaps checklist"
```

---

## Task 8: Typed content loader

**Files:**

- Create: `src/lib/content.ts`, `tests/unit/content.test.ts`

- [ ] **Step 1: Write the failing loader test**

`tests/unit/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getPortfolio, localized, getFeaturedProjects } from '@/lib/content';

describe('content loader', () => {
  it('returns validated, typed portfolio data', () => {
    const p = getPortfolio();
    expect(p.profile.name).toBe('Ali Emad');
  });

  it('localized() picks the right language and falls back to en', () => {
    const field = { en: 'Hello', ar: 'مرحبا' };
    expect(localized(field, 'ar')).toBe('مرحبا');
    expect(localized(field, 'en')).toBe('Hello');
    // unknown locale falls back to en
    expect(localized(field, 'fr' as 'en')).toBe('Hello');
  });

  it('getFeaturedProjects returns only featured entries', () => {
    const featured = getFeaturedProjects();
    expect(featured.every((p) => p.featured)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

RUN (node): `pnpm test tests/unit/content.test.ts`
Expected: FAIL — cannot find module `@/lib/content`.

- [ ] **Step 3: Implement the loader**

`src/lib/content.ts`:

```ts
import raw from '../../content/portfolio.json';
import { portfolioSchema, type Portfolio, type LocalizedString } from '@/lib/schema';

export type Locale = 'en' | 'ar';

// Parse & validate once at module load. Throws loudly on malformed content.
const portfolio: Portfolio = portfolioSchema.parse(raw);

export function getPortfolio(): Portfolio {
  return portfolio;
}

export function localized(field: LocalizedString, locale: Locale): string {
  return locale === 'ar' ? field.ar : field.en;
}

export function getFeaturedProjects() {
  return portfolio.projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return portfolio.projects.find((p) => p.slug === slug) ?? null;
}
```

- [ ] **Step 4: Run to verify it passes**

RUN (node): `pnpm test tests/unit/content.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat(data): typed content loader + localized() helper"
```

---

## Task 9: next-intl (EN + Arabic RTL)

**Files:**

- Create: `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`, `middleware.ts`, `messages/en.json`, `messages/ar.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install**

RUN (node): `pnpm add next-intl`

- [ ] **Step 2: Routing config**

`src/i18n/routing.ts`:

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
```

- [ ] **Step 3: Navigation helpers**

`src/i18n/navigation.ts`:

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 4: Request config**

`src/i18n/request.ts`:

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 5: Middleware**

`middleware.ts` (repo root):

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 6: Wire the plugin in `next.config.ts`**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Message files**

`messages/en.json`:

```json
{
  "nav": {
    "about": "About",
    "projects": "Projects",
    "skills": "Skills",
    "experience": "Experience",
    "contact": "Contact",
    "blog": "Blog"
  },
  "actions": {
    "viewResume": "View résumé",
    "getInTouch": "Get in touch",
    "viewProject": "View project",
    "readMore": "Read more"
  },
  "hero": { "greeting": "Hi, I'm" },
  "footer": { "builtWith": "Built with Next.js, GSAP & Motion", "rights": "All rights reserved." },
  "locale": { "switchToArabic": "العربية", "switchToEnglish": "English" }
}
```

`messages/ar.json`:

```json
{
  "nav": {
    "about": "نبذة",
    "projects": "المشاريع",
    "skills": "المهارات",
    "experience": "الخبرة",
    "contact": "تواصل",
    "blog": "المدونة"
  },
  "actions": {
    "viewResume": "عرض السيرة الذاتية",
    "getInTouch": "تواصل معي",
    "viewProject": "عرض المشروع",
    "readMore": "اقرأ المزيد"
  },
  "hero": { "greeting": "مرحبًا، أنا" },
  "footer": {
    "builtWith": "بُني باستخدام Next.js و GSAP و Motion",
    "rights": "جميع الحقوق محفوظة."
  },
  "locale": { "switchToArabic": "العربية", "switchToEnglish": "English" }
}
```

- [ ] **Step 8: Verify type-check still passes**

RUN (node): `pnpm exec tsc --noEmit`
Expected: no errors. (The `[locale]` layout that consumes these lands in Task 10; build is verified there.)

- [ ] **Step 9: Commit**

```
git add -A
git commit -m "feat(i18n): next-intl routing, middleware, en/ar messages"
```

---

## Task 10: Bilingual root layout + home shell

**Files:**

- Create: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- Delete: `src/app/layout.tsx`, `src/app/page.tsx` (the non-localized scaffold)
- Create: `src/lib/fonts.ts`

- [ ] **Step 1: Fonts (Latin + Arabic) via next/font**

`src/lib/fonts.ts`:

```ts
import { Sora, IBM_Plex_Sans_Arabic } from 'next/font/google';

export const fontLatin = Sora({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
});

export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});
```

- [ ] **Step 2: Localized layout**

`src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontLatin, fontArabic } from '@/lib/fonts';
import { getPortfolio } from '@/lib/content';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Ali Emad — Frontend Engineer',
  description: 'Portfolio of Ali Emad, frontend engineer.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const profile = getPortfolio().profile;

  return (
    <html lang={locale} dir={dir} className={`${fontLatin.variable} ${fontArabic.variable}`}>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <NextIntlClientProvider>
          <Header profileName={profile.name} />
          <main id="content">{children}</main>
          <Footer socials={getPortfolio().socials} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Home page shell**

`src/app/[locale]/page.tsx`:

```tsx
import { setRequestLocale } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { profile } = getPortfolio();
  const l = locale as Locale;

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-muted text-sm">
        {profile.location.en /* replaced with localized() below */}
      </p>
      <h1 className="mt-2 text-4xl font-bold sm:text-6xl">{profile.name}</h1>
      <p className="text-muted mt-4 text-lg">{localized(profile.role, l)}</p>
      <p className="mt-6 max-w-prose text-balance">{localized(profile.tagline, l)}</p>
    </section>
  );
}
```

Then fix the placeholder comment line to use `localized(profile.location, l)`:

```tsx
<p className="text-muted text-sm">{localized(profile.location, l)}</p>
```

- [ ] **Step 4: Remove the non-localized scaffold routes**

Delete `src/app/layout.tsx` and `src/app/page.tsx`. (Header/Footer are created in Task 12; create empty stubs now so the build passes — see Step 5.)

- [ ] **Step 5: Temporary Header/Footer stubs (replaced in Task 12)**

`src/components/layout/Header.tsx`:

```tsx
export function Header({ profileName }: { profileName: string }) {
  return <header className="px-6 py-4 text-sm font-semibold">{profileName}</header>;
}
```

`src/components/layout/Footer.tsx`:

```tsx
export function Footer({ socials }: { socials: { label: string; url: string }[] }) {
  return (
    <footer className="text-muted px-6 py-8 text-sm">
      {socials.map((s) => (
        <a key={s.url} href={s.url} className="me-4 underline">
          {s.label}
        </a>
      ))}
    </footer>
  );
}
```

- [ ] **Step 6: Build to verify routing + RTL**

RUN (node): `pnpm build`
Expected: builds `/` (en) and `/ar` routes. (`bg-background`/`text-muted` tokens are defined in Task 11 — if the build complains about unknown utilities, proceed to Task 11 then re-run.)

- [ ] **Step 7: Commit**

```
git add -A
git commit -m "feat(app): bilingual [locale] layout + home shell + fonts"
```

---

## Task 11: Tailwind v4 dark-premium tokens

**Files:**

- Modify: `src/styles/globals.css`

- [ ] **Step 1: Define the design tokens + base**

Replace `src/styles/globals.css` with:

```css
@import 'tailwindcss';

@theme {
  --color-background: #08080b;
  --color-foreground: #f4f4f6;
  --color-muted: #9a9aa6;
  --color-surface: #101015;
  --color-border: #23232b;
  --color-accent: #7c5cff;
  --color-accent-foreground: #ffffff;

  --font-sans: var(--font-latin), var(--font-arabic), ui-sans-serif, system-ui, sans-serif;

  --radius: 0.75rem;
}

:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
}

/* Global reduced-motion safety net (animation infra arrives in Plan 2). */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 2: Rebuild**

RUN (node): `pnpm build`
Expected: builds cleanly; `bg-background`, `text-foreground`, `text-muted` now resolve.

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "feat(styles): dark-premium design tokens (tailwind v4 @theme)"
```

---

## Task 12: Layout chrome — Header, Footer, LocaleSwitcher

**Files:**

- Modify: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
- Create: `src/components/layout/LocaleSwitcher.tsx`, `tests/unit/locale-switcher.test.tsx`

- [ ] **Step 1: LocaleSwitcher — failing test**

`tests/unit/locale-switcher.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('LocaleSwitcher', () => {
  it('renders a control to switch to Arabic when in English', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleSwitcher currentLocale="en" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: 'العربية' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

RUN (node): `pnpm test tests/unit/locale-switcher.test.tsx`
Expected: FAIL — cannot find module `@/components/layout/LocaleSwitcher`.

- [ ] **Step 3: Implement LocaleSwitcher**

`src/components/layout/LocaleSwitcher.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

export function LocaleSwitcher({ currentLocale }: { currentLocale: 'en' | 'ar' }) {
  const t = useTranslations('locale');
  const pathname = usePathname();
  const target = currentLocale === 'en' ? 'ar' : 'en';
  const label = target === 'ar' ? t('switchToArabic') : t('switchToEnglish');

  return (
    <Link href={pathname} locale={target} className="text-muted hover:text-foreground text-sm">
      {label}
    </Link>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

RUN (node): `pnpm test tests/unit/locale-switcher.test.tsx`
Expected: 1 passed.

- [ ] **Step 5: Real Header with nav + switcher**

`src/components/layout/Header.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function Header({
  profileName,
  locale,
}: {
  profileName: string;
  locale: 'en' | 'ar';
}) {
  const t = await getTranslations('nav');
  const sections = ['about', 'projects', 'skills', 'experience', 'contact'] as const;

  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
      <Link href="/" className="font-semibold">
        {profileName}
      </Link>
      <nav className="text-muted hidden gap-6 text-sm sm:flex">
        {sections.map((s) => (
          <a key={s} href={`#${s}`} className="hover:text-foreground">
            {t(s)}
          </a>
        ))}
      </nav>
      <LocaleSwitcher currentLocale={locale} />
    </header>
  );
}
```

Update the layout call in `src/app/[locale]/layout.tsx` to pass `locale`: `<Header profileName={profile.name} locale={dir === 'rtl' ? 'ar' : 'en'} />`.

- [ ] **Step 6: Real Footer**

`src/components/layout/Footer.tsx`:

```tsx
import { getTranslations } from 'next-intl/server';

export async function Footer({ socials }: { socials: { label: string; url: string }[] }) {
  const t = await getTranslations('footer');
  return (
    <footer className="border-border text-muted border-t px-6 py-10 text-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{t('builtWith')}</p>
        <div className="flex gap-4">
          {socials.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Full verification**

RUN (node): `pnpm test && pnpm build`
Expected: all unit tests pass; `/` and `/ar` build.

- [ ] **Step 8: Commit**

```
git add -A
git commit -m "feat(layout): header nav, footer, locale switcher"
```

---

## Task 13: CI (GitHub Actions)

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 2: Commit**

```
git add -A
git commit -m "ci: type-check, lint, test, build on push/PR"
```

---

## Task 14: Docs — `.env.example` + README

**Files:**

- Create: `.env.example`, update `README.md`

- [ ] **Step 1: `.env.example`**

```
# Public canonical URL (used later for metadata/OG/sitemap)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Contact form (added in Plan 3)
RESEND_API_KEY=
CONTACT_TO_EMAIL=sonnythedeveloper@gmail.com
```

- [ ] **Step 2: README**

Write a concise README covering: what the project is, the WSL command convention (from the Environment section of this plan), scripts (`dev`, `build`, `type-check`, `lint`, `test`), the data model (single `content/portfolio.json` validated by Zod; UI strings in `messages/`), and the i18n/RTL convention.

- [ ] **Step 3: Commit**

```
git add -A
git commit -m "docs: env example + README (setup, data model, i18n)"
```

---

## Definition of Done (Plan 1)

- `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build` all pass.
- Visiting `/` renders English; `/ar` renders Arabic with `dir="rtl"` on `<html>`.
- All portfolio content originates from `content/portfolio.json`, validated by Zod at load; malformed content fails the build/tests.
- Header (nav + locale switch), Footer, dark-premium tokens, and both fonts are in place.
- No animation code yet (Plan 2).
- CI green on the first push.

**Next:** Plan 2 (Animation infrastructure + core sections) — authored just-in-time, gated on the live animation design-gallery selection.
