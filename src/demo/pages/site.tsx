"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useDemo } from "../state";
import { FeatureGate } from "../components/bits";
import { ChampionsSite } from "../components/champions-site";
import { DemoLangToggle } from "../components/shell";

export function SitePage() {
  const { d, dir } = useDemo();
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  return (
    <FeatureGate feature="website">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between border-b bg-muted/60 px-4 py-2 text-sm">
          <Link href="/demo/website" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <Back className="size-4" />
            {d.site.back}
          </Link>
          <DemoLangToggle />
        </div>
        <ChampionsSite />
      </div>
    </FeatureGate>
  );
}
