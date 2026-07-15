import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPosts } from '@/lib/blog';
import { BlogShell, type BlogPostLink } from '@/components/blog/BlogShell';

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');

  const posts: BlogPostLink[] = getPosts(locale).map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    readingTime: p.readingTime,
    tags: p.tags,
  }));

  return (
    <BlogShell
      posts={posts}
      locale={locale}
      labels={{
        explorer: t('explorer'),
        filter: t('filter'),
        back: t('back'),
        posts: t('posts'),
        close: t('close'),
        noMatches: t('noMatches'),
      }}
    >
      {children}
    </BlogShell>
  );
}
