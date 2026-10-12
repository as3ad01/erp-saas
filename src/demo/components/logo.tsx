import { cn } from "@/lib/utils";

function star(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? outer : inner;
    const a = ((-90 + k * 36) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const STAR = star(20, 21, 12.5, 5.2);

/** Placeholder club mark. Each real client gets their own. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-g)" />
      <polygon points={STAR} fill="#fde68a" />
      <circle cx="20" cy="21" r="2.4" fill="#b91c1c" />
    </svg>
  );
}
