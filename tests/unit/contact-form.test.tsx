import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import { ContactForm } from '@/components/forms/ContactForm';

function setup() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

describe('ContactForm', () => {
  it('renders labelled, required fields and a submit button', () => {
    setup();
    expect(screen.getByLabelText('Name')).toBeRequired();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Message')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('exposes a polite status live region for submit feedback', () => {
    setup();
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
