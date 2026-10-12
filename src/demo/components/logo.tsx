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
      <rect width="40" height="40" rx="11" fill="#dc2626" />
      <polygon points={STAR} fill="#fde68a" />
      <circle cx="20" cy="21" r="2.4" fill="#b91c1c" />
    </svg>
  );
}
