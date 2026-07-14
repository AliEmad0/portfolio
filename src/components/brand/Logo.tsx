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
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  return (
    <span className={`logo ${className}`} role="img" aria-label="Ali Emad — Portfolio">
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
