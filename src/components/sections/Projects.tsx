import { getTranslations } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Reveal } from '@/animation/Reveal';
import { ProjectRow } from './ProjectRow';

export async function Projects({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const { projects } = getPortfolio();

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <p data-reveal-item className="text-accent font-mono text-xs tracking-[0.28em] uppercase">
          {t('projects.eyebrow')}
        </p>
        <h2
          data-reveal-item
          className="mt-2 mb-12 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          {t('nav.projects')}
        </h2>
      </Reveal>

      <div className="flex flex-col gap-4">
        {projects.map((p, i) => (
          <ProjectRow
            key={p.slug}
            index={i}
            name={p.name}
            summary={localized(p.summary, locale)}
            description={localized(p.description, locale)}
            stack={p.stack}
            href={p.links[0]?.url ?? '#'}
            featuredLabel={p.featured ? t('projects.featured') : undefined}
            viewLabel={t('actions.viewProject')}
            numberLabel={String(i + 1).padStart(2, '0')}
          />
        ))}
      </div>
    </section>
  );
}
