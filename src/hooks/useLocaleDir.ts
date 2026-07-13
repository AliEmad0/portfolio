'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/content';

export type Direction = 'ltr' | 'rtl';

export function dirFor(locale: string): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** +1 for ltr, -1 for rtl — multiply x-axis motion so it moves the correct way per direction. */
export function signFor(locale: string): 1 | -1 {
  return locale === 'ar' ? -1 : 1;
}

/** Client hook: current direction + x-axis sign, derived from the active locale. */
export function useLocaleDir(): { dir: Direction; sign: 1 | -1; locale: Locale } {
  const locale = useLocale() as Locale;
  return { dir: dirFor(locale), sign: signFor(locale), locale };
}
