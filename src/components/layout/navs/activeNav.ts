export type NavTarget = { id: string; href?: string };

function normalizePath(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/(?:en|ar)(?=\/|$)/, '');
  return withoutLocale || '/';
}

export function getActiveNavId(
  items: readonly NavTarget[],
  pathname: string,
  activeSection: string,
): string {
  const currentPath = normalizePath(pathname);
  const activePage = items.find((item) => {
    if (!item.href || item.href.includes('#')) return false;
    const targetPath = normalizePath(item.href);
    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  });

  return activePage?.id ?? activeSection;
}
