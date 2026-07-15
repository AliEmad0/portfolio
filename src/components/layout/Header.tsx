import { getLocale, getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/brand/BrandMark';
import { EdgeText } from './navs/EdgeText';
import { RadialNav, type NavItem } from './RadialNav';

export async function Header() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  // Section links are locale-absolute so they still work from /blog (where the
  // sections don't exist); on the homepage the click is intercepted and
  // smooth-scrolled instead. Blog is a real page, not a section.
  const sections = ['about', 'projects', 'skills', 'experience'] as const;
  const items: NavItem[] = [
    ...sections.map((s) => ({ id: s, label: t(s), href: `/${locale}#${s}` })),
    { id: 'blog', label: t('blog'), href: `/${locale}/blog` },
    { id: 'contact', label: t('contact'), href: `/${locale}#contact` },
  ];

  // `display: contents` — no header box; each element positions itself fixed.
  // Brand mark: free top-left corner. Desktop nav: vertical edge-text rail
  // (right-center). Mobile nav: the radial menu, top-right.
  return (
    <header className="contents">
      <BrandMark label={t('home')} />
      <div className="hidden md:block">
        <EdgeText items={items} />
      </div>
      <div className="md:hidden">
        <div className="nav-fixed-corner">
          <RadialNav items={items} menuLabel={t('menu')} closeLabel={t('close')} />
        </div>
      </div>
    </header>
  );
}
