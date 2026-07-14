import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  // Always prefix the locale (/en, /ar). The root `/` deterministically
  // redirects to /en regardless of the browser's Accept-Language.
  localePrefix: 'always',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
