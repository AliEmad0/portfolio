import { getTranslations } from 'next-intl/server';
import { getPortfolio, localized, type Locale } from '@/lib/content';
import { Reveal } from '@/animation/Reveal';

export async function About({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');
  const { about } = getPortfolio();

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
        <div>
          <p data-reveal-item className="text-accent font-mono text-xs tracking-[0.28em] uppercase">
            {t('about')}
          </p>
          <div className="text-muted mt-6 max-w-2xl space-y-5 text-lg leading-relaxed">
            {about.paragraphs.map((p, i) => (
              <p key={i} data-reveal-item>
                {localized(p, locale)}
              </p>
            ))}
          </div>
        </div>

        <dl
          data-reveal-item
          className="border-border divide-border h-fit divide-y rounded-2xl border p-6"
        >
          {about.facts.map((f, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <dt className="text-muted font-mono text-xs tracking-wide uppercase">
                {localized(f.label, locale)}
              </dt>
              <dd className="text-foreground text-end text-sm font-medium">
                {localized(f.value, locale)}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
