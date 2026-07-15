import { setRequestLocale } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Hero, type HeroSocial } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Experience } from '@/components/sections/Experience';
import { Contact } from '@/components/sections/Contact';

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
        name={localized(profile.name, l)}
        role={localized(profile.role, l)}
        tagline={localized(profile.tagline, l)}
        tags={tags}
        socials={heroSocials}
        resumeUrl={profile.resumeUrl}
      />
      <About locale={l} />
      <Projects locale={l} />
      <Skills locale={l} />
      <Experience locale={l} />
      <Contact />
    </>
  );
}
