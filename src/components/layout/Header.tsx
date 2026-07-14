import { getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/brand/BrandMark';
import { EdgeText } from './navs/EdgeText';
import { RadialNav, type NavItem } from './RadialNav';

export async function Header() {
  const t = await getTranslations('nav');
  const sections = ['about', 'projects', 'skills', 'experience', 'contact'] as const;
  const items: NavItem[] = sections.map((s) => ({ id: s, label: t(s) }));

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
