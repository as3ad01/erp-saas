import { BELTS, MIN_ATTENDANCE_FOR_PROMOTION, type Member, type Tier } from "./data";

export type Feature = "belts" | "parent" | "reports" | "competitions" | "branches" | "website";

const TIER_RANK: Record<Tier, number> = { basic: 0, standard: 1, pro: 2 };
export const FEATURE_TIER: Record<Feature, Tier> = {
  belts: "standard",
  parent: "standard",
  reports: "standard",
  competitions: "pro",
  branches: "pro",
  website: "pro",
};

export function tierAllows(pkg: Tier, feature: Feature) {
  return TIER_RANK[pkg] >= TIER_RANK[FEATURE_TIER[feature]];
}

export function daysAtBelt(m: Member) {
  return m.beltHistory[0]?.daysAgo ?? m.joinedDaysAgo;
}

export function monthsAtBelt(m: Member) {
  return Math.floor(daysAtBelt(m) / 30);
}

export function isEligible(m: Member) {
  if (m.belt >= BELTS.length - 1) return false;
  if (m.expiresInDays < 0) return false;
  return (
    daysAtBelt(m) >= BELTS[m.belt].minMonths * 30 && m.attendance >= MIN_ATTENDANCE_FOR_PROMOTION
  );
}

/** 0-100 progress toward the next belt, based on time at the current belt. */
export function beltProgress(m: Member) {
  if (m.belt >= BELTS.length - 1) return 100;
  return Math.min(100, Math.round((daysAtBelt(m) / (BELTS[m.belt].minMonths * 30)) * 100));
}

export type SubStatus = "expired" | "expiring" | "active";
export function subStatus(m: Member): SubStatus {
  if (m.expiresInDays < 0) return "expired";
  if (m.expiresInDays <= 7) return "expiring";
  return "active";
}

export function initials(name: string) {
  // Skip the Arabic article "ال" so "الراشد" gives "ر", not "ا".
  const parts = name.trim().split(/\s+/).map((p) => p.replace(/^ال(?=.{2})/, ""));
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
