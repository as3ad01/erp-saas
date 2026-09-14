import type { Module } from "@/generated/prisma/enums";
import type { Dictionary } from "@/i18n/get-dictionary";

export const ALL_MODULES: Module[] = ["INVENTORY", "SALES", "PURCHASING", "ACCOUNTING"];

export function moduleInfo(dict: Dictionary) {
  return dict.modules;
}
