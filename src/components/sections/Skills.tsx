import { getTranslations } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Reveal } from '@/animation/Reveal';
import { SkillsGrid, type SkillCategory } from './SkillsGrid';

export async function Skills({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const { skills } = getPortfolio();

  const categories: SkillCategory[] = skills.map((s) => ({
    category: localized(s.category, locale),
    items: s.items,
  }));

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <p data-reveal-item className="text-accent font-mono text-xs tracking-[0.28em] uppercase">
          {t('skills.eyebrow')}
        </p>
        <h2
          data-reveal-item
          className="mt-2 mb-12 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          {t('nav.skills')}
        </h2>
      </Reveal>

      <SkillsGrid categories={categories} />
    </section>
  );
}
