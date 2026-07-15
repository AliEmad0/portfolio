import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site';
import { getPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}`]));

  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    changeFrequency: 'monthly',
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));

  const blogIndex: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}/blog`,
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}/blog`])),
    },
  }));

  const posts: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    getPosts(locale).map((p) => ({
      url: `${siteUrl}/${locale}/blog/${p.slug}`,
      lastModified: new Date(`${p.date}T00:00:00Z`),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  );

  return [...home, ...blogIndex, ...posts];
}
