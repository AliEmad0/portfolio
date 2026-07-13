import { setRequestLocale } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Hero, type HeroSocial } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const { profile, skills, socials } = getPortfolio();

  const tags = skills.flatMap((s) => s.items).slice(0, 6);
  const heroSocials: HeroSocial[] = [
    ...socials.map((s) => ({ label: s.label, url: s.url, icon: s.icon })),
    { label: 'Email', url: `mailto:${profile.email}`, icon: 'mail' },
  ];

  return (
    <>
      <Hero
        name={profile.name}
        role={localized(profile.role, l)}
        tagline={localized(profile.tagline, l)}
        tags={tags}
        socials={heroSocials}
      />
      <About locale={l} />
    </>
  );
}
