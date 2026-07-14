/**
 * Fills the empty side of a project card (desktop only): an animated "border
 * beam" — a light beam travels around a bordered panel holding the project logo.
 * Project-agnostic: the mark is the project's initial, the wordmark its name.
 */
export function ProjectVisual({ name }: { name: string }) {
  const initial = name.charAt(0);
  return (
    <div className="pv hidden md:flex" aria-hidden>
      <div className="pv-beam">
        <div className="pv-beam-inner">
          <span className="pv-logo" dir="ltr">
            <span className="pv-mark">{initial}</span>
            {name}
          </span>
        </div>
      </div>
    </div>
  );
}
