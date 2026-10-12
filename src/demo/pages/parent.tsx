"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Lightbulb } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DEMO_PARENT_ID } from "../data";
import { useDemo } from "../state";
import { PageHeader } from "../components/bits";
import { LatestBanner, ParentApp, PhoneFrame, WhatsAppChat } from "../components/phone";

export function ParentPage() {
  const { d } = useDemo();
  const [view, setView] = useState<"app" | "wa">("wa");

  return (
    <div>
      <PageHeader
        title={d.parent.title}
        subtitle={d.parent.subtitle}
        actions={
          <Link href="/demo/phone" className={buttonVariants({ variant: "outline" })}>
            <ExternalLink />
            {d.parent.openReal}
          </Link>
        }
      />

      <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">{d.parent.tipTitle}</p>
            <p className="text-sm text-muted-foreground">{d.parent.tip}</p>
          </div>
        </CardContent>
      </Card>

      {/* Phones: side by side on large screens, switchable on small ones. */}
      <div className="mb-4 flex justify-center lg:hidden">
        <div className="inline-flex gap-0.5 rounded-full border bg-muted p-0.5 text-sm">
          {(["app", "wa"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-4 py-1 transition-colors",
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {v === "app" ? d.parent.appPhone : d.parent.waPhone}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-10">
        <div className={cn("flex-col items-center gap-3", view === "app" ? "flex" : "hidden", "lg:flex")}>
          <PhoneFrame>
            <ParentApp parentId={DEMO_PARENT_ID} />
          </PhoneFrame>
          <p className="text-sm font-medium text-muted-foreground">{d.parent.appPhone}</p>
        </div>
        <div className={cn("flex-col items-center gap-3", view === "wa" ? "flex" : "hidden", "lg:flex")}>
          <PhoneFrame banner={<LatestBanner parentId={DEMO_PARENT_ID} />}>
            <WhatsAppChat parentId={DEMO_PARENT_ID} />
          </PhoneFrame>
          <p className="text-sm font-medium text-muted-foreground">{d.parent.waPhone}</p>
        </div>
      </div>
    </div>
  );
}
