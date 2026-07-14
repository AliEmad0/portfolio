import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CustomCursor } from '@/animation/CustomCursor';

const env = vi.hoisted(() => ({ reduced: false, finePointer: true }));

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => env.reduced }));

vi.mock('gsap', () => ({
  default: {
    set: vi.fn(),
    to: vi.fn(),
    quickTo: vi.fn(() => vi.fn()),
    registerPlugin: vi.fn(),
  },
}));

beforeEach(() => {
  env.reduced = false;
  env.finePointer = true;
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('pointer: fine') ? env.finePointer : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.className = '';
});

describe('CustomCursor', () => {
  it('renders nothing under reduced motion', () => {
    env.reduced = true;
    const { container } = render(<CustomCursor />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing on a coarse (touch) pointer', () => {
    env.finePointer = false;
    const { container } = render(<CustomCursor />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the cursor on a fine pointer with motion allowed', () => {
    const { container } = render(<CustomCursor />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();
    expect(document.body.classList.contains('has-custom-cursor')).toBe(true);
  });
});
