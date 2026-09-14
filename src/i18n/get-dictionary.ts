import "server-only";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import type { Locale } from "./config";

export type { Dictionary } from "./dictionaries/en";

const dictionaries = { en, ar };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
