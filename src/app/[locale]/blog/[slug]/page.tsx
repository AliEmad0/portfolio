import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { setRequestLocale } from 'next-intl/server';
import { siteUrl } from '@/lib/site';
import { getPost, getPostBody, getAllPostParams } from '@/lib/blog';
import { RTL_LOCALES } from './og/route';
import { Typewriter, twDuration } from '@/components/blog/Typewriter';

export function generateStaticParams() {
  return getAllPostParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  const path = `/${locale}/blog/${slug}`;
  // Per-post card from the sibling og/ route handler — referenced explicitly
  // rather than via the opengraph-image file convention, which breaks under the
  // dynamic [locale] segment on Vercel (PR #8).
  //
  // RTL posts fall back to the brand card: satori can't order Arabic words
  // (bidi), so a generated card would read backwards. See og/route.tsx.
  const ogImage = RTL_LOCALES.has(locale)
    ? { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: 'Ali Emad — Portfolio' }
    : { url: `${siteUrl}${path}/og`, width: 1200, height: 630, alt: post.title };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${siteUrl}${path}`,
      publishedTime: post.date,
      tags: post.tags,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(locale, slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: getPostBody(locale, slug),
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false }],
        ],
      },
    },
  });

  // R01 — the frontmatter block types itself out, then the body fades in.
  const fm: string[] = [
    '---',
    `title: "${post.title}"`,
    `date: ${post.date}`,
    ...(post.tags.length ? [`tags: [${post.tags.join(', ')}]`] : []),
    `readingTime: ${post.readingTime}`,
    '---',
  ];
  let at = 0;
  const timed = fm.map((line) => {
    const delay = at;
    at = twDuration(line, delay);
    return { line, delay };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale,
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: 'Ali Emad', url: siteUrl },
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${slug}`,
  };

  return (
    <article className="ide-post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <pre className="ide-fm" dir="ltr" aria-label="frontmatter">
        {timed.map(({ line, delay }, i) => (
          <span className="ide-fm-line" key={i}>
            <Typewriter text={line} delay={delay} />
            {'\n'}
          </span>
        ))}
      </pre>

      <div className="ide-prose" style={{ animation: `ide-body-in .5s ${at + 90}ms both` }}>
        <h1>{post.title}</h1>
        <p className="ide-post-meta">
          <time dateTime={post.date}>
            {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(new Date(`${post.date}T00:00:00`))}
          </time>
          <span aria-hidden> · </span>
          <span>{post.readingTime} min</span>
        </p>
        {content}
      </div>
    </article>
  );
}
