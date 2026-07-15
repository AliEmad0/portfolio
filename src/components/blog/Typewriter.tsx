/**
 * R01 — typewriter reveal.
 *
 * The text is rendered for real and revealed with a stepped `clip-path`, so
 * crawlers, screen readers and no-JS visitors get the whole string immediately;
 * only the paint is staged. Server-safe (no client JS).
 *
 * clip-path percentages resolve against the element's own box, so this is
 * script-agnostic — unlike a `ch`-based width animation, which mis-measures
 * Arabic (not monospaced) and clips the text. Only duration/delay/steps are set
 * inline; the animation *name* comes from CSS so RTL can flip the reveal
 * direction (globals.css). Dropped under `prefers-reduced-motion`.
 */
export function Typewriter({
  text,
  delay = 0,
  msPerChar = 26,
  className = '',
}: {
  text: string;
  delay?: number;
  msPerChar?: number;
  className?: string;
}) {
  const chars = Math.max([...text].length, 1);
  const duration = Math.min(chars * msPerChar, 1800);
  return (
    <span
      className={`tw ${className}`}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationTimingFunction: `steps(${chars})`,
      }}
    >
      {text}
    </span>
  );
}

/** When a Typewriter with these params finishes — for sequencing what follows. */
export function twDuration(text: string, delay = 0, msPerChar = 26) {
  return delay + Math.min(Math.max([...text].length, 1) * msPerChar, 1800);
}
