/**
 * Canonical site origin, sourced from NEXT_PUBLIC_SITE_URL with the production
 * Vercel URL as a fallback. Trailing slashes are stripped so callers can safely
 * template `${siteUrl}/path` without producing `//`.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ali-emad-portfolio.vercel.app'
).replace(/\/+$/, '');
