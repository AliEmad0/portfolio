import { getTranslations } from 'next-intl/server';
import { getPortfolio } from '@/lib/content';
import { Reveal } from '@/animation/Reveal';
import { ContactForm } from '@/components/forms/ContactForm';

/**
 * Dedicated contact section — the destination for the nav's Contact link
 * (`#contact`), sitting just above the sign-off footer. A short intro with the
 * direct email on the left, the Resend-backed form on the right.
 */
export async function Contact() {
  const t = await getTranslations('contact');
  const { profile } = getPortfolio();

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-start">
        <div data-reveal-item>
          <p className="text-accent font-mono text-xs tracking-[0.28em] uppercase">
            {t('eyebrow')}
          </p>
          <h2 className="mt-5 text-3xl font-semibold text-balance sm:text-4xl">{t('heading')}</h2>
          <p className="text-muted mt-4 max-w-md leading-relaxed">{t('subheading')}</p>
          <a
            href={`mailto:${profile.email}`}
            dir="ltr"
            className="nav-link text-foreground mt-6 inline-block font-mono text-sm"
          >
            {profile.email}
          </a>
        </div>
        <div data-reveal-item>
          <ContactForm />
        </div>
      </Reveal>
    </section>
  );
}
