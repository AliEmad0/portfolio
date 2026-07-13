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
