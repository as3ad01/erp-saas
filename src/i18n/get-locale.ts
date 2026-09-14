import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, localeCookieName } from "./config";

export async function getLocale() {
  const store = await cookies();
  const value = store.get(localeCookieName)?.value;
  return isValidLocale(value) ? value : defaultLocale;
}
