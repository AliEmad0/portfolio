import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from '@/hooks/useActiveSection';

function section(id: string, absTop: number) {
  const el = document.createElement('section');
  el.id = id;
  el.getBoundingClientRect = () => ({ top: absTop - window.scrollY }) as DOMRect;
  document.body.appendChild(el);
}

function setScroll(y: number, innerH: number, scrollH: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: innerH, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollH,
    configurable: true,
  });
}

const fire = () => act(() => window.dispatchEvent(new Event('scroll')));

beforeEach(() => {
  // No-op rAF so the scroll-position poll doesn't recurse; the dispatched
  // `scroll` events drive recompute in tests.
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useActiveSection', () => {
  it('activates the section whose top has passed the scroll line', () => {
    section('about', 0);
    section('projects', 1000);
    section('contact', 3000);

    setScroll(0, 800, 3800);
    const { result } = renderHook(() => useActiveSection(['about', 'projects', 'contact']));
    expect(result.current).toBe('about');

    setScroll(900, 800, 3800);
    fire();
    expect(result.current).toBe('projects');
  });

  it('activates the last section (e.g. footer #contact) when scrolled to the bottom', () => {
    section('about', 0);
    section('experience', 2000);
    section('contact', 3700); // short footer near the very bottom

    // At the bottom, the line (3000 + 256) sits inside experience, but the
    // bottom override must still pick contact.
    setScroll(3000, 800, 3800);
    const { result } = renderHook(() => useActiveSection(['about', 'experience', 'contact']));
    fire();
    expect(result.current).toBe('contact');
  });

  it('ignores ids whose element is absent from the DOM', () => {
    section('about', 0);
    section('projects', 1000);
    setScroll(0, 800, 2000);
    const { result } = renderHook(() => useActiveSection(['about', 'projects', 'contact']));
    expect(result.current).toBe('about');
  });
});
