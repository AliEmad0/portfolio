import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LenisProvider } from '@/animation/LenisProvider';

const state = vi.hoisted(() => ({ reduced: true }));
const created = vi.hoisted(() => ({ count: 0 }));

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => state.reduced }));

vi.mock('lenis', () => ({
  default: class {
    on = vi.fn();
    off = vi.fn();
    raf = vi.fn();
    destroy = vi.fn();
    constructor() {
      created.count += 1;
    }
  },
}));

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));

describe('LenisProvider / useLenis', () => {
  it('renders children', () => {
    state.reduced = true;
    render(
      <LenisProvider>
        <span>child</span>
      </LenisProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('creates no Lenis instance under reduced motion', () => {
    state.reduced = true;
    created.count = 0;
    render(
      <LenisProvider>
        <span>child</span>
      </LenisProvider>,
    );
    expect(created.count).toBe(0);
  });

  it('creates a Lenis instance when motion is allowed', () => {
    state.reduced = false;
    created.count = 0;
    render(
      <LenisProvider>
        <span>child</span>
      </LenisProvider>,
    );
    // Instance lives in a ref (no re-render); assert it was constructed.
    expect(created.count).toBe(1);
  });
});
