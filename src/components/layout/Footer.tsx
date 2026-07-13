import { getTranslations } from 'next-intl/server';

export async function Footer({ socials }: { socials: { label: string; url: string }[] }) {
  const t = await getTranslations('footer');
  return (
    <footer className="border-border text-muted border-t px-6 py-10 text-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{t('builtWith')}</p>
        <div className="flex gap-4">
          {socials.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
