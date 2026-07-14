import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Nav, type NavItem } from './Nav';

export async function Header({
  profileName,
  locale,
}: {
  profileName: string;
  locale: 'en' | 'ar';
}) {
  const t = await getTranslations('nav');
  const sections = ['about', 'projects', 'skills', 'experience', 'contact'] as const;
  const items: NavItem[] = sections.map((s) => ({ id: s, label: t(s) }));

  return (
    <header className="border-border bg-background/70 sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
      <Link href="/" className="nav-link font-semibold">
        {profileName}
      </Link>
      <Nav items={items} />
      <LocaleSwitcher currentLocale={locale} />
    </header>
  );
}
