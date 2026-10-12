"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "../state";
import { PageHeader } from "../components/bits";
import { ChampionsSite } from "../components/champions-site";

export function WebsitePage() {
  const { d } = useDemo();
  return (
    <div>
      <PageHeader
        title={d.site.title}
        subtitle={d.site.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(`${window.location.origin}/demo/site`);
                } catch {
                  // clipboard may be unavailable; the toast is still fine for a demo.
                }
                toast.success(d.site.copied);
              }}
            >
              <Copy />
              {d.site.copyLink}
            </Button>
            <Button render={<Link href="/demo/site" target="_blank" />}>
              <ExternalLink />
              {d.site.openFull}
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border shadow-lg">
        <div className="flex items-center gap-3 border-b bg-muted px-4 py-2.5">
          <div className="flex gap-1.5" dir="ltr">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-amber-400" />
            <span className="size-3 rounded-full bg-emerald-400" />
          </div>
          <div dir="ltr" className="flex-1 truncate rounded-md bg-background px-3 py-1 text-center text-xs text-muted-foreground">
            goldendragon.example/champions
          </div>
        </div>
        <div className="max-h-[720px] overflow-y-auto">
          <ChampionsSite embedded />
        </div>
      </div>
    </div>
  );
}
