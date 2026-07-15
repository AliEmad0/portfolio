import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site';
import { getPosts } from '@/lib/blog';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rfc822 = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString();

/** Per-locale RSS 2.0 feed: /en/rss.xml and /ar/rss.xml */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = getPosts(locale);
  const self = `${siteUrl}/${locale}/rss.xml`;

  // Derived from the newest post rather than the clock, so rebuilding the same
  // content produces a byte-identical feed.
  const lastBuild = posts[0] ? rfc822(posts[0].date) : rfc822('2026-01-01');

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/${locale}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${rfc822(p.date)}</pubDate>
${p.tags.map((tag) => `      <category>${esc(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(t('title'))} — Ali Emad</title>
    <link>${siteUrl}/${locale}/blog</link>
    <description>${esc(t('description'))}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
