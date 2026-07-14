import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadialNav } from '@/components/layout/RadialNav';

const lenisState = vi.hoisted(() => ({
  ref: { current: null as null | { scrollTo: ReturnType<typeof vi.fn> } },
}));

vi.mock('@/animation/LenisProvider', () => ({ useLenis: () => lenisState.ref }));
vi.mock('@/hooks/useActiveSection', () => ({ useActiveSection: () => 'projects' }));
vi.mock('@/hooks/useLocaleDir', () => ({
  useLocaleDir: () => ({ dir: 'ltr', sign: 1, locale: 'en' }),
}));

const items = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

function setup() {
  return render(<RadialNav items={items} menuLabel="Menu" closeLabel="Close" />);
}

beforeEach(() => {
  lenisState.ref.current = null;
  document.body.innerHTML =
    '<header style="height:60px"></header><section id="about"></section><section id="projects"></section>';
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('RadialNav', () => {
  it('renders a toggle and all section links', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#projects');
  });

  it('toggles open/closed and updates the aria-label', () => {
    setup();
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-label', 'Close');
  });

  it('marks the active section', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('data-active', 'false');
  });

  it('smooth-scrolls via Lenis when a target exists', () => {
    lenisState.ref.current = { scrollTo: vi.fn() };
    setup();
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(notPrevented).toBe(false); // preventDefault called
    expect(lenisState.ref.current.scrollTo).toHaveBeenCalledOnce();
  });

  it('falls back to window.scrollTo when Lenis is null', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    setup();
    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(scrollSpy).toHaveBeenCalledOnce();
  });

  it('lets the browser handle a target not in the DOM', () => {
    setup();
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Contact' }));
    expect(notPrevented).toBe(true); // preventDefault NOT called
  });
});
