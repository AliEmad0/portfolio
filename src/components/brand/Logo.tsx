type LogoVariant = 'full' | 'mark' | 'wordmark';

/**
 * The Ali Emad identity: a gradient "AE" monogram tile beside a two-line
 * ALI EMAD / PORTFOLIO lockup (concept #21). Presentational and server-safe.
 * Scale it by setting `font-size` on the root via `className`. Variants:
 * `full` (mark + wordmark), `mark` (tile only), `wordmark` (text only).
 */
export function Logo({
  variant = 'full',
  className = '',
  decorative = false,
  label = 'Ali Emad — Portfolio',
}: {
  variant?: LogoVariant;
  className?: string;
  /** Hide the logo from the a11y tree (for purely decorative repeats). */
  decorative?: boolean;
  /** Accessible name when the logo IS the label — e.g. a home button wrapping
   *  only the mark. Exposed as a single `role="img"` name so the "AE" glyph is
   *  treated as an image, not competing visible text. */
  label?: string;
}) {
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': label } as const);
  return (
    <span className={`logo ${className}`} {...a11y}>
      {variant !== 'wordmark' && (
        <span className="logo-mark" aria-hidden>
          <span className="logo-ae">AE</span>
        </span>
      )}
      {variant === 'full' && <span className="logo-divider" aria-hidden />}
      {variant !== 'mark' && (
        <span className="logo-words" aria-hidden>
          <span className="logo-name">ALI EMAD</span>
          <span className="logo-sub">PORTFOLIO</span>
        </span>
      )}
    </span>
  );
}
