'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none';

export function ContactForm() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      message: String(fd.get('message') ?? ''),
      company: String(fd.get('company') ?? ''), // honeypot
    };
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="cf-name"
            className="text-muted text-xs font-medium tracking-wide uppercase"
          >
            {t('name')}
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            className={inputClass}
            disabled={busy}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="cf-email"
            className="text-muted text-xs font-medium tracking-wide uppercase"
          >
            {t('email')}
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className={inputClass}
            disabled={busy}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="cf-message"
          className="text-muted text-xs font-medium tracking-wide uppercase"
        >
          {t('message')}
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder={t('messagePlaceholder')}
          className={`${inputClass} resize-y`}
          disabled={busy}
        />
      </div>

      {/* Honeypot — hidden from users, catches bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="bg-accent rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? t('sending') : t('send')}
        </button>
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${status === 'error' ? 'text-accent-3' : 'text-accent-2'}`}
        >
          {status === 'success' ? t('success') : status === 'error' ? t('error') : ''}
        </p>
      </div>
    </form>
  );
}
