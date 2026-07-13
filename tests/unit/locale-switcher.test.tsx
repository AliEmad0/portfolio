import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
  Link: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
}));

describe('LocaleSwitcher', () => {
  it('renders a control to switch to Arabic when in English', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleSwitcher currentLocale="en" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('link', { name: 'العربية' })).toBeInTheDocument();
  });
});
