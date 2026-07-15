'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export type BlogPostLink = {
  slug: string;
  title: string;
  date: string;
  readingTime: number;
  tags: string[];
};

export type BlogLabels = {
  explorer: string;
  filter: string;
  back: string;
  posts: string;
  close: string;
  noMatches: string;
};

/**
 * The IDE shell: explorer (file tree) + tab strip + editor pane, wrapping the
 * blog index and every post. Lives in the blog layout, so its tab state
 * survives client-side navigation between posts.
 *
 * Motion: E01 boot sequence (CSS, on first mount), H02 icon spin + H07 row
 * fill wipe on hover/tap (CSS), T17 glow pulse on a newly opened tab, T10
 * fly-up on close.
 *
 * Tabs are derived — accumulated opens plus the current post — and only ever
 * mutated from event handlers, never from an effect.
 */
export function BlogShell({
  posts,
  locale,
  labels,
  children,
}: {
  posts: BlogPostLink[];
  locale: string;
  labels: BlogLabels;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}/blog`;

  const current = useMemo(() => {
    const m = pathname?.match(/\/blog\/([^/?#]+)/);
    return m?.[1] ? decodeURIComponent(m[1]) : null;
  }, [pathname]);

  const [opened, setOpened] = useState<string[]>([]);
  const [justOpened, setJustOpened] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const known = useMemo(() => new Set(posts.map((p) => p.slug)), [posts]);

  const tabs = useMemo(() => {
    const list = opened.filter((s) => known.has(s));
    if (current && known.has(current) && !list.includes(current)) list.push(current);
    return list;
  }, [opened, current, known]);

  /** Snapshot the post we're leaving, then add the one being opened. */
  const openFrom = (slug: string) => {
    setOpened((prev) => {
      const next = [...prev];
      if (current && known.has(current) && !next.includes(current)) next.push(current);
      if (!next.includes(slug)) next.push(slug);
      return next;
    });
    setJustOpened(slug);
  };

  const closeTab = (slug: string) => {
    setClosing(slug);
    const remaining = tabs.filter((s) => s !== slug);
    window.setTimeout(() => {
      setOpened(remaining);
      setClosing(null);
      if (current === slug) {
        const next = remaining[remaining.length - 1];
        router.push(next ? `${base}/${next}` : base);
      }
    }, 320);
  };

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? posts.filter((p) => p.title.toLowerCase().includes(needle) || p.slug.includes(needle))
    : posts;

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`));

  return (
    <div className="ide" data-view={current ? 'post' : 'index'}>
      <aside className="ide-explorer">
        <div className="ide-exp-head">
          <span className="ide-exp-title">▾ content/blog</span>
          <span className="ide-exp-count">
            {posts.length} {labels.posts}
          </span>
        </div>
        <div className="ide-search">
          <span aria-hidden>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.filter}
            aria-label={labels.filter}
            dir="ltr"
          />
        </div>
        <nav className="ide-files" aria-label={labels.explorer}>
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`${base}/${p.slug}`}
              onClick={() => openFrom(p.slug)}
              className="ide-file"
              data-active={current === p.slug}
              data-cursor
            >
              <span className="ide-file-ic" aria-hidden>
                ◆
              </span>
              <span className="ide-file-meta">
                <span className="ide-file-name" dir="ltr">
                  {p.slug}.mdx
                </span>
                <span className="ide-file-sub">
                  {fmt(p.date)}
                  {p.tags.length ? ` · ${p.tags.map((t) => `#${t}`).join(' ')}` : ''}
                </span>
              </span>
              <span className="ide-file-rt">{p.readingTime}′</span>
            </Link>
          ))}
          {!filtered.length && <p className="ide-nomatch">{labels.noMatches}</p>}
        </nav>
      </aside>

      <div className="ide-main">
        {tabs.length > 0 && (
          <div className="ide-tabs">
            {tabs.map((slug) => {
              const p = posts.find((x) => x.slug === slug);
              if (!p) return null;
              return (
                <span
                  key={slug}
                  className="ide-tab"
                  data-active={current === slug}
                  data-new={justOpened === slug ? '' : undefined}
                  data-closing={closing === slug ? '' : undefined}
                >
                  <Link href={`${base}/${slug}`} className="ide-tab-link" dir="ltr">
                    {slug}.mdx
                  </Link>
                  <button
                    type="button"
                    className="ide-tab-x"
                    onClick={() => closeTab(slug)}
                    aria-label={`${labels.close}: ${p.title}`}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <div className="ide-editor">
          {current && (
            <Link href={base} className="ide-back" aria-label={labels.back}>
              <span aria-hidden>‹</span>
            </Link>
          )}
          {children}
        </div>
      </div>

      <div className="ide-status">
        <span>⎇ main</span>
        <span className="ide-status-file" dir="ltr">
          {current ? `content/blog/${locale}/${current}.mdx` : `${posts.length} files`}
        </span>
        <span className="ide-status-r">MDX · UTF-8</span>
      </div>
    </div>
  );
}
