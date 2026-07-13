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
