interface RssIconProps {
  size?: number;
  className?: string;
}

export default function RssIcon({ size = 12, className }: RssIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Outer broadcast arc */}
      <path d="M2 3.5 a10.5 10.5 0 0 1 10.5 10.5" opacity="0.9" />
      <path d="M2 7.5 a6.5 6.5 0 0 1 6.5 6.5" opacity="0.7" />
      {/* Center dot */}
      <circle cx="3.5" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
