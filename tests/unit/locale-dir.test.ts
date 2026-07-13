import { describe, it, expect } from 'vitest';
import { dirFor, signFor } from '@/hooks/useLocaleDir';

describe('locale direction helpers', () => {
  it('dirFor maps Arabic to rtl and others to ltr', () => {
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('en')).toBe('ltr');
  });

  it('signFor flips the x-axis for rtl', () => {
    expect(signFor('en')).toBe(1);
    expect(signFor('ar')).toBe(-1);
  });
});
