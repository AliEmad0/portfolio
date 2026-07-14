import { getTranslations } from 'next-intl/server';
import { EdgeText } from './navs/EdgeText';
import { RadialNav, type NavItem } from './RadialNav';

export async function Header() {
  const t = await getTranslations('nav');
  const sections = ['about', 'projects', 'skills', 'experience', 'contact'] as const;
  const items: NavItem[] = sections.map((s) => ({ id: s, label: t(s) }));

  // `display: contents` — no header box; each nav positions itself fixed.
  // Desktop: vertical edge-text rail. Mobile: the radial menu (edge text is
  // cramped on small screens).
  return (
    <header className="contents">
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
