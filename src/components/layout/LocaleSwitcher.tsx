'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** The subset of the View Transitions API we rely on (still experimental). */
type ViewTransition = {
  ready?: Promise<unknown>;
  finished?: Promise<unknown>;
};
type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

export function LocaleSwitcher({ currentLocale }: { currentLocale: 'en' | 'ar' }) {
  const t = useTranslations('locale');
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const target = currentLocale === 'en' ? 'ar' : 'en';
  const label = target === 'ar' ? t('switchToArabic') : t('switchToEnglish');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const navigate = () => router.replace(pathname, { locale: target });
    const doc = document as VTDocument;
    if (!reduced && typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(navigate);
      // `ready`/`finished` reject when a transition is interrupted or aborted
      // (rapid switches, async route commit). Swallow to avoid an unhandledRejection.
      transition?.ready?.catch(() => {});
      transition?.finished?.catch(() => {});
    } else {
      navigate();
    }
  };

  return (
    <a
      href={pathname}
      hrefLang={target}
      onClick={handleClick}
      className="nav-link text-muted hover:text-foreground text-sm"
    >
      {label}
    </a>
  );
}
