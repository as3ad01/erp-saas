"use client";

import { cn } from "@/lib/utils";
import { localeCookieName, type Locale } from "@/i18n/config";

export function LanguageToggle({ locale }: { locale: Locale }) {
  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000`;
    // A full reload (not router.refresh()) is required here: Clerk's own
    // widgets (SignIn/SignUp/UserButton) only read the `localization` prop
    // once at mount, so a soft RSC refresh updates our own text but leaves
    // Clerk's rendered language stuck on whatever it started with.
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-input bg-muted p-0.5 text-sm">
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "ar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}
