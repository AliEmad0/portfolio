import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function Header({
  profileName,
  locale,
}: {
  profileName: string;
  locale: 'en' | 'ar';
}) {
  const t = await getTranslations('nav');
  const sections = ['about', 'projects', 'skills', 'experience', 'contact'] as const;

  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
      <Link href="/" className="font-semibold">
        {profileName}
      </Link>
      <nav className="text-muted hidden gap-6 text-sm sm:flex">
        {sections.map((s) => (
          <a key={s} href={`#${s}`} className="hover:text-foreground">
            {t(s)}
          </a>
        ))}
      </nav>
      <LocaleSwitcher currentLocale={locale} />
    </header>
  );
}
