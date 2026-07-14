import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontLatin, fontArabic } from '@/lib/fonts';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LenisProvider } from '@/animation/LenisProvider';
import { PageEntrance } from '@/animation/PageEntrance';
import { CustomCursor } from '@/animation/CustomCursor';
import { Starfield } from '@/animation/Starfield';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ali-emad-portfolio.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = 'Ali Emad — Senior Front-End Developer';
  const description =
    'Portfolio of Ali Emad — senior front-end developer building fast, polished, accessible web interfaces with React, Next.js, and TypeScript.';
  const path = `/${locale}`;

  // opengraph-image.png / twitter-image.png and the icon set are wired
  // automatically from src/app file conventions.
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: '%s · Ali Emad' },
    description,
    applicationName: 'Ali Emad — Portfolio',
    authors: [{ name: 'Ali Emad' }],
    creator: 'Ali Emad',
    alternates: { canonical: path, languages: { en: '/en', ar: '/ar' } },
    openGraph: {
      type: 'website',
      siteName: 'Ali Emad — Portfolio',
      title,
      description,
      url: path,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const l = locale as Locale;
  const dir = l === 'ar' ? 'rtl' : 'ltr';
  const { profile, socials } = getPortfolio();

  return (
    <html lang={locale} dir={dir} className={`${fontLatin.variable} ${fontArabic.variable}`}>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <Starfield />
        <NextIntlClientProvider>
          <LenisProvider>
            <CustomCursor />
            <Header />
            <PageEntrance>
              <main id="content">{children}</main>
            </PageEntrance>
            <Footer socials={socials} email={profile.email} name={localized(profile.name, l)} />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
