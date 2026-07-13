import { getTranslations } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Reveal } from '@/animation/Reveal';
import { TimelineItem } from './TimelineItem';

export async function Experience({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const { timeline } = getPortfolio();

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <p data-reveal-item className="text-accent font-mono text-xs tracking-[0.28em] uppercase">
          {t('experience.eyebrow')}
        </p>
        <h2
          data-reveal-item
          className="mt-2 mb-14 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          {t('nav.experience')}
        </h2>
      </Reveal>

      <div className="ms-1">
        {timeline.map((e, i) => {
          const end = e.end === 'present' ? t('experience.present') : e.end;
          return (
            <TimelineItem
              key={i}
              index={i}
              ghostYear={e.start}
              period={`${e.start} — ${end}`}
              title={localized(e.title, locale)}
              org={localized(e.org, locale)}
              description={localized(e.description, locale)}
            />
          );
        })}
      </div>
    </section>
  );
}
