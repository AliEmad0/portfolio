import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site';
import { getPosts } from '@/lib/blog';
import { Typewriter } from '@/components/blog/Typewriter';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const path = `/${locale}/blog`;
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: path, languages: { en: '/en/blog', ar: '/ar/blog' } },
    openGraph: {
      type: 'website',
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}${path}`,
    },
  };
}

/** The "no file open" editor state — an IDE welcome screen. */
export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const posts = getPosts(locale);
  const latest = posts[0];

  return (
    <div className="ide-welcome">
      <p className="ide-welcome-kicker">
        <Typewriter text={`~/${locale}/blog $ ls -la`} />
      </p>
      <h1 className="ide-welcome-title">{t('title')}</h1>
      <p className="ide-welcome-sub">{t('description')}</p>

      <dl className="ide-welcome-stats">
        <div>
          <dt>{t('posts')}</dt>
          <dd>{posts.length}</dd>
        </div>
        <div>
          <dt>{t('latest')}</dt>
          <dd>{latest ? latest.title : '—'}</dd>
        </div>
        <div>
          <dt>{t('tags')}</dt>
          <dd>{[...new Set(posts.flatMap((p) => p.tags))].length}</dd>
        </div>
      </dl>

      <p className="ide-welcome-hint">{t('hint')}</p>
    </div>
  );
}
