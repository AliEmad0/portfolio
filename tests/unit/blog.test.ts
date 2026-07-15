import { describe, it, expect } from 'vitest';
import { frontmatterSchema, readingTime, getPosts, getPost, getAllPostParams } from '@/lib/blog';

describe('blog frontmatter schema', () => {
  const valid = {
    title: 'A post',
    description: 'About something.',
    date: '2026-07-15',
  };

  it('accepts a minimal post and defaults tags/draft', () => {
    const r = frontmatterSchema.parse(valid);
    expect(r.tags).toEqual([]);
    expect(r.draft).toBe(false);
  });

  it('rejects a malformed date so the build fails loudly', () => {
    expect(frontmatterSchema.safeParse({ ...valid, date: '15-07-2026' }).success).toBe(false);
    expect(frontmatterSchema.safeParse({ ...valid, date: '2026-7-5' }).success).toBe(false);
  });

  it('requires a title and description', () => {
    expect(frontmatterSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
    expect(frontmatterSchema.safeParse({ date: valid.date, title: 'x' }).success).toBe(false);
  });
});

describe('readingTime', () => {
  it('floors at one minute', () => {
    expect(readingTime('just a few words')).toBe(1);
  });

  it('scales at ~200wpm', () => {
    expect(readingTime('word '.repeat(400))).toBe(2);
  });
});

describe('post loading', () => {
  it('returns English posts newest first', () => {
    const posts = getPosts('en');
    expect(posts.length).toBeGreaterThan(0);
    const dates = posts.map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('derives slug, locale and readingTime', () => {
    const post = getPost('en', 'rtl-done-right');
    expect(post).not.toBeNull();
    expect(post?.slug).toBe('rtl-done-right');
    expect(post?.locale).toBe('en');
    expect(post?.readingTime).toBeGreaterThanOrEqual(1);
  });

  it('returns null for an unknown slug', () => {
    expect(getPost('en', 'nope-not-real')).toBeNull();
  });

  it('exposes every locale/slug pair for static params + sitemap', () => {
    const params = getAllPostParams();
    expect(params).toContainEqual({ locale: 'en', slug: 'rtl-done-right' });
    expect(params).toContainEqual({ locale: 'ar', slug: 'rtl-done-right' });
  });
});
