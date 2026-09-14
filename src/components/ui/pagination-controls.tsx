import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

// Server-rendered pager: builds prev/next links that preserve every other
// query param (e.g. the search term) and only change `page`.
export function PaginationControls({
  dict,
  page,
  totalPages,
  searchParams,
}: {
  dict: Dictionary;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const navClass = cn(buttonVariants({ variant: "outline", size: "sm" }));
  const disabledClass = "pointer-events-none opacity-50";

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        {t(dict.common.pageOf, { page, totalPages })}
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <span className={cn(navClass, disabledClass)}>{dict.common.previous}</span>
        ) : (
          <Link href={hrefForPage(page - 1)} className={navClass}>
            {dict.common.previous}
          </Link>
        )}
        {page >= totalPages ? (
          <span className={cn(navClass, disabledClass)}>{dict.common.next}</span>
        ) : (
          <Link href={hrefForPage(page + 1)} className={navClass}>
            {dict.common.next}
          </Link>
        )}
      </div>
    </div>
  );
}
