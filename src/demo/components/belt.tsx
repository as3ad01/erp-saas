"use client";

import { cn } from "@/lib/utils";
import { BELTS } from "../data";
import { useDemo } from "../state";

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/** A tied karate belt. */
export function BeltGraphic({ belt, className }: { belt: number; className?: string }) {
  const color = BELTS[belt].color;
  const dark = shade(color, -38);
  const darker = shade(color, -70);
  // White and black belts need an outline to stay visible in both light and dark mode.
  const edge = belt === 0 ? "#d6d3d1" : belt === BELTS.length - 1 ? "#78716c" : "transparent";
  return (
    <svg viewBox="0 0 120 48" className={cn("h-12 w-[120px]", className)} aria-hidden>
      {/* tails */}
      <polygon points="52,24 44,46 56,42 62,26" fill={dark} stroke={edge} />
      <polygon points="66,24 80,44 90,38 74,22" fill={dark} stroke={edge} />
      {/* band */}
      <rect x="2" y="12" width="116" height="14" rx="3" fill={color} stroke={edge} />
      <rect x="2" y="12" width="116" height="4" rx="2" fill="#fff" opacity="0.18" />
      {/* knot */}
      <rect x="48" y="7" width="24" height="24" rx="6" fill={dark} stroke={edge} />
      <rect x="53" y="12" width="14" height="14" rx="4" fill={darker} opacity="0.55" />
    </svg>
  );
}

export function BeltChip({ belt, className }: { belt: number; className?: string }) {
  const { L } = useDemo();
  const b = BELTS[belt];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <span
        className="size-3 shrink-0 rounded-full ring-1 ring-foreground/30"
        style={{ backgroundColor: b.color }}
      />
      {L(b.name)}
    </span>
  );
}

export function BeltDot({ belt, className }: { belt: number; className?: string }) {
  return (
    <span
      className={cn("inline-block size-3 shrink-0 rounded-full ring-1 ring-foreground/30", className)}
      style={{ backgroundColor: BELTS[belt].color }}
    />
  );
}
