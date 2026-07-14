import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from '@/hooks/useActiveSection';

type CB = (entries: Partial<IntersectionObserverEntry>[]) => void;

let lastCallback: CB | null = null;
let observed: Element[] = [];
let disconnected = false;

class FakeIO {
  constructor(cb: CB) {
    lastCallback = cb;
  }
  observe(el: Element) {
    observed.push(el);
  }
  disconnect() {
    disconnected = true;
  }
  unobserve() {}
}

beforeEach(() => {
  lastCallback = null;
  observed = [];
  disconnected = false;
  vi.stubGlobal('IntersectionObserver', FakeIO as unknown as typeof IntersectionObserver);
  document.body.innerHTML = '<section id="about"></section><section id="projects"></section>';
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useActiveSection', () => {
  it('observes only sections present in the DOM', () => {
    renderHook(() => useActiveSection(['about', 'projects', 'contact']));
    // 'contact' has no element, so only two are observed
    expect(observed.map((e) => (e as HTMLElement).id).sort()).toEqual(['about', 'projects']);
  });

  it('activates the most-visible section', () => {
    const { result } = renderHook(() => useActiveSection(['about', 'projects']));
    expect(result.current).toBe('');

    act(() => {
      lastCallback?.([
        { target: document.getElementById('about')!, isIntersecting: true, intersectionRatio: 0.3 },
        {
          target: document.getElementById('projects')!,
          isIntersecting: true,
          intersectionRatio: 0.7,
        },
      ]);
    });
    expect(result.current).toBe('projects');

    act(() => {
      lastCallback?.([
        { target: document.getElementById('about')!, isIntersecting: true, intersectionRatio: 0.9 },
      ]);
    });
    expect(result.current).toBe('about');
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(['about']));
    unmount();
    expect(disconnected).toBe(true);
  });
});
