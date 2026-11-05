interface HopbuMarkProps {
  className?: string;
  title?: string;
}

// Inlined so it stays sharp at every size, loads with the page, and can be
// swapped for a CSS-themed variant without a round-trip. The raster PNGs in
// /public/hopbu/ are for apple-touch-icon and PWA manifest only.
export default function HopbuMark({ className, title }: HopbuMarkProps) {
  return (
    <svg
      className={className}
      viewBox="12 11.5 176 176"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M38 90 L46 22 L94 56 Z"
        fill="#B0654E"
        stroke="#B0654E"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d="M162 90 L154 22 L106 56 Z"
        fill="#B0654E"
        stroke="#B0654E"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <rect x={30} y={52} width={140} height={128} rx={44} fill="#B0654E" />
      <circle cx={74} cy={114} r={10} fill="#F7E3C9" />
      <circle cx={126} cy={114} r={10} fill="#F7E3C9" />
      <path
        d="M93 136 L107 136 L100 144 Z"
        fill="#F7E3C9"
        stroke="#F7E3C9"
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </svg>
  );
}
