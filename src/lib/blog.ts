import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { routing } from '@/i18n/routing';

/**
 * Blog content lives as MDX in `content/blog/<locale>/<slug>.mdx`, version
 * controlled alongside the code — no CMS, no database. Frontmatter is validated
 * with zod so a malformed post fails the build instead of shipping broken.
 */
export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** ISO date, e.g. 2026-07-14 */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type PostMeta = Frontmatter & {
  slug: string;
  locale: string;
  /** whole minutes, floored at 1 */
  readingTime: number;
};

const ROOT = path.join(process.cwd(), 'content', 'blog');

const dirFor = (locale: string) => path.join(ROOT, locale);

/** ~200 wpm, floored at 1 minute. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readPost(locale: string, file: string): PostMeta {
  const slug = file.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(dirFor(locale), file), 'utf8');
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/blog/${locale}/${file}: ${parsed.error.issues
        .map((i) => `${i.path.join('.')} ${i.message}`)
        .join('; ')}`,
    );
  }
  return { ...parsed.data, slug, locale, readingTime: readingTime(content) };
}

/** All posts for a locale, newest first. Drafts are excluded in production. */
export function getPosts(locale: string): PostMeta[] {
  const dir = dirFor(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => readPost(locale, f))
    .filter((p) => !p.draft || process.env.NODE_ENV === 'development')
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(locale: string, slug: string): PostMeta | null {
  const file = path.join(dirFor(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const post = readPost(locale, `${slug}.mdx`);
  if (post.draft && process.env.NODE_ENV !== 'development') return null;
  return post;
}

/** Raw MDX body (frontmatter stripped) for compiling. */
export function getPostBody(locale: string, slug: string): string {
  const raw = fs.readFileSync(path.join(dirFor(locale), `${slug}.mdx`), 'utf8');
  return matter(raw).content;
}

/** Every (locale, slug) pair — used by generateStaticParams and the sitemap. */
export function getAllPostParams(): { locale: string; slug: string }[] {
  return routing.locales.flatMap((locale) =>
    getPosts(locale).map((p) => ({ locale, slug: p.slug })),
  );
}
