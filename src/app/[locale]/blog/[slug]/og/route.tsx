import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getPost, getAllPostParams } from '@/lib/blog';

export const dynamic = 'force-static';

/**
 * Per-post OG card, generated at build.
 *
 * This is a *route handler*, not an `opengraph-image` file convention: a
 * metadata image under the dynamic `[locale]` segment trips a Next invariant on
 * Vercel when a stale build cache is restored (see PR #8). Posts reference this
 * URL explicitly from their metadata instead.
 *
 * RTL locales are deliberately excluded. satori (next/og) shapes Arabic glyphs
 * correctly but does NOT apply the bidi algorithm for *word ordering* — it lays
 * words out left-to-right, so "الكتابة من اليمين" renders first-word-leftmost
 * and the sentence reads backwards. `direction: rtl`, font-stack reordering and
 * right-alignment all fail to fix it (the reversal is in satori's layout, not
 * its shaping). A card that reads backwards is worse than a generic one, so
 * Arabic posts fall back to the brand card (/og.png) — see the post page's
 * generateMetadata. Revisit if satori gains real bidi support.
 */
export const RTL_LOCALES = new Set(['ar']);

export function generateStaticParams() {
  return getAllPostParams().filter((p) => !RTL_LOCALES.has(p.locale));
}

// Read at build time; never shipped to the client.
const sora = fs.readFileSync(path.join(process.cwd(), 'src', 'assets', 'fonts', 'Sora-Bold.ttf'));

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (RTL_LOCALES.has(locale)) return new Response('Not found', { status: 404 });

  const post = getPost(locale, slug);
  if (!post) return new Response('Not found', { status: 404 });

  const titleSize = post.title.length > 58 ? 54 : post.title.length > 34 ? 64 : 76;
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${post.date}T00:00:00Z`));

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#08080b',
        backgroundImage:
          'radial-gradient(900px 520px at 10% -10%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(760px 520px at 100% 110%, rgba(67,230,208,0.18), transparent 60%)',
        fontFamily: 'Sora',
      }}
    >
      {/* header: AE mark + section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 84,
            height: 84,
            borderRadius: 22,
            backgroundColor: '#0b0b11',
            border: '1px solid #2a2a38',
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: -2,
              backgroundImage: 'linear-gradient(135deg, #7c5cff, #43e6d0 55%, #ff7ac2)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            AE
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#f4f4f6' }}>Ali Emad</div>
          <div style={{ fontSize: 16, letterSpacing: 6, color: '#43e6d0' }}>WRITING</div>
        </div>
      </div>

      {/* title */}
      <div
        style={{
          display: 'flex',
          fontSize: titleSize,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: -2,
          color: '#ffffff',
          maxWidth: 1000,
        }}
      >
        {post.title}
      </div>

      {/* footer: meta + url */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 54, height: 4, borderRadius: 4, backgroundColor: '#7c5cff' }} />
          {/* single text node — satori requires display:flex on any element
                with more than one child */}
          <div style={{ fontSize: 22, color: '#b7b7c2' }}>
            {`${date} · ${post.readingTime} min read`}
          </div>
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {post.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    fontSize: 18,
                    color: '#cfcfd8',
                    border: '1px solid #ffffff26',
                    borderRadius: 999,
                    padding: '4px 14px',
                  }}
                >
                  {`#${tag}`}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', fontSize: 20, color: '#8f8f9b' }}>
          ali-emad-portfolio.vercel.app
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Sora', data: sora, weight: 700, style: 'normal' }],
    },
  );
}
