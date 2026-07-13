import { setRequestLocale } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { profile } = getPortfolio();
  const l = locale as Locale;

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-muted text-sm">{localized(profile.location, l)}</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-6xl">{profile.name}</h1>
      <p className="text-muted mt-4 text-lg">{localized(profile.role, l)}</p>
      <p className="mt-6 max-w-prose text-balance">{localized(profile.tagline, l)}</p>
    </section>
  );
}
