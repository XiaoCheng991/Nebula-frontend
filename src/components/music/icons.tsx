/**
 * Shared SVG icons for both music player shells (dark nav popover and
 * light sidebar panel). Custom paths: hand-tuned for the 16x16 viewBox,
 * monochrome so they take the current text colour and stay crisp.
 */


// ===============================================================
// SVG ICONS
// Custom paths: hand-tuned for the 16x16 viewBox, monochrome so
// they take the current text colour and stay crisp on the nav bar.
// ===============================================================

export function IconNote({ size = 13 }: { size?: number }) {
  // Eighth note glyph with a flag - more legible than the unicode
  // character at 13px size, and consistent across systems.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 2 L11 10" />
      <path d="M11 2 L5.5 4 L5.5 12" />
      <circle cx="4.25" cy="12" r="1.75" fill="currentColor" stroke="none" />
      <circle cx="9.75" cy="10" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPlay({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 2.5 L4 13.5 L13 8 Z" />
    </svg>
  );
}

export function IconPause({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="3.5" y="2.5" width="3" height="11" />
      <rect x="9.5" y="2.5" width="3" height="11" />
    </svg>
  );
}

export function IconPrev({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="2" height="11" />
      <path d="M13.5 2.5 L13.5 13.5 L5 8 Z" />
    </svg>
  );
}

export function IconNext({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <rect x="11.5" y="2.5" width="2" height="11" />
      <path d="M2.5 2.5 L2.5 13.5 L11 8 Z" />
    </svg>
  );
}
