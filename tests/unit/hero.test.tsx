import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import { Hero } from '@/components/sections/Hero';

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

const socials = [
  { label: 'GitHub', url: 'https://github.com/AliEmad0', icon: 'github' },
  { label: 'Email', url: 'mailto:a@b.com', icon: 'mail' },
];

function renderHero() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Hero
        name="Ali Emad"
        role="Frontend Engineer"
        tagline="A distinctive tagline."
        tags={['React', 'GSAP']}
        socials={socials}
        resumeUrl="/resume.pdf"
      />
    </NextIntlClientProvider>,
  );
}

describe('Hero', () => {
  it('renders the name as the h1 (visible without JS)', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ali Emad');
  });

  it('renders the tagline and tech tags', () => {
    renderHero();
    expect(screen.getByText('A distinctive tagline.')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('GSAP')).toBeInTheDocument();
  });

  it('renders the CTAs and social links', () => {
    renderHero();
    expect(screen.getByRole('link', { name: 'View work' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get in touch' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View résumé' })).toHaveAttribute(
      'href',
      '/resume.pdf',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/AliEmad0',
    );
  });
});
