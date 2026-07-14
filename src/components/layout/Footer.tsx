export function Footer({ socials }: { socials: { label: string; url: string }[] }) {
  return (
    <footer className="border-border text-muted border-t px-6 py-10 text-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-4">
        {socials.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="nav-link hover:text-foreground"
          >
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
