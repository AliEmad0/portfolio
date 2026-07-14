import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Nav } from '@/components/layout/Nav';

const lenisState = vi.hoisted(() => ({
  ref: { current: null as null | { scrollTo: ReturnType<typeof vi.fn> } },
}));

vi.mock('@/animation/LenisProvider', () => ({ useLenis: () => lenisState.ref }));
vi.mock('@/hooks/useActiveSection', () => ({ useActiveSection: () => 'projects' }));

const items = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

beforeEach(() => {
  lenisState.ref.current = null;
  document.body.innerHTML =
    '<header style="height:60px"></header><section id="about"></section><section id="projects"></section>';
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Nav', () => {
  it('renders all items as anchor links', () => {
    render(<Nav items={items} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#projects');
  });

  it('marks the active section', () => {
    render(<Nav items={items} />);
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('data-active', 'false');
  });

  it('smooth-scrolls via Lenis when a target exists', () => {
    lenisState.ref.current = { scrollTo: vi.fn() };
    render(<Nav items={items} />);
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(notPrevented).toBe(false); // preventDefault was called
    expect(lenisState.ref.current.scrollTo).toHaveBeenCalledOnce();
  });

  it('falls back to window.scrollTo when Lenis is null', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Nav items={items} />);
    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));
    expect(scrollSpy).toHaveBeenCalledOnce();
  });

  it('lets the browser handle a target that is not in the DOM', () => {
    render(<Nav items={items} />);
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Contact' }));
    expect(notPrevented).toBe(true); // preventDefault NOT called
  });
});
