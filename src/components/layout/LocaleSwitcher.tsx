'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitcher({ currentLocale }: { currentLocale: 'en' | 'ar' }) {
  const t = useTranslations('locale');
  const pathname = usePathname();
  const target = currentLocale === 'en' ? 'ar' : 'en';
  const label = target === 'ar' ? t('switchToArabic') : t('switchToEnglish');

  return (
    <Link href={pathname} locale={target} className="text-muted hover:text-foreground text-sm">
      {label}
    </Link>
  );
}
