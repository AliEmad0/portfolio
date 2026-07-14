import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/Logo';
import { BackToTop } from './BackToTop';

type FooterProps = {
  socials: { label: string; url: string }[];
  email: string;
  name: string;
};

/**
 * Contact-forward footer: a full-width availability strip, a giant email that
 * fills with the accent gradient on hover, and a back-to-top control. Carries
 * `id="contact"` so it is the destination for the nav's Contact link.
 */
export async function Footer({ socials, email, name }: FooterProps) {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-border mt-24 border-t">
      <a href={`mailto:${email}`} className="avail-strip">
        {t('availability')} <span aria-hidden>→</span>
      </a>

      <div className="px-6 py-16 text-center">
        <a href={`mailto:${email}`} className="giant-email" dir="ltr">
          {email}
        </a>
      </div>

      <div className="flex justify-center px-6 pb-12" dir="ltr">
        <Logo variant="full" className="text-[20px]" />
      </div>

      <div className="text-muted mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 pb-10 text-sm">
        <div className="flex gap-4">
          {socials.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="nav-link hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
        <span className="hidden sm:inline">
          © {year} {name}
        </span>
        <BackToTop label={t('backToTop')} />
      </div>
    </footer>
  );
}
