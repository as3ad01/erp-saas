import type { Lang } from "./data";

const DAY = 86_400_000;

export function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function pct(n: number) {
  return `${Math.round(n)}%`;
}

function intlLocale(lang: Lang) {
  // "nu-latn" keeps Western digits (0-9) in Arabic text, always.
  return lang === "ar" ? "ar-EG-u-nu-latn" : "en-US";
}

export function dateOffset(now: Date, daysAgo: number) {
  return new Date(now.getTime() - daysAgo * DAY);
}

export function formatDate(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}

export function formatMonthYear(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}

export function formatMonth(now: Date, monthsAgo: number, lang: Lang) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  return new Intl.DateTimeFormat(intlLocale(lang), { month: "short", timeZone: "UTC" }).format(d);
}

export function formatWeekday(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), { weekday: "short", timeZone: "UTC" }).format(
    dateOffset(now, daysAgo)
  );
}

export function formatTime(h: number, m: number, lang: Lang) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, "0");
  const suffix = lang === "ar" ? (h < 12 ? "ص" : "م") : h < 12 ? "AM" : "PM";
  return `${h12}:${mm} ${suffix}`;
}

/** "in 3 days", "tomorrow", "2 days ago"... n > 0 is the future. */
export function relDays(n: number, lang: Lang) {
  const a = Math.abs(n);
  if (lang === "en") {
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n > 0 ? `in ${a} days` : `${a} days ago`;
  }
  if (n === 0) return "اليوم";
  if (n === 1) return "غدًا";
  if (n === -1) return "أمس";
  if (a === 2) return n > 0 ? "بعد يومين" : "قبل يومين";
  const unit = a <= 10 ? `${a} أيام` : `${a} يومًا`;
  return n > 0 ? `بعد ${unit}` : `قبل ${unit}`;
}

export function formatDay(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}
