"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DEMO_PARENT_ID } from "../data";
import { useDemo } from "../state";
import { FeatureGate } from "../components/bits";
import { DemoLangToggle } from "../components/shell";
import { LatestBanner, ParentApp } from "../components/phone";

/** The parents' app, full screen, for opening on a real phone. */
export function PhonePage() {
  const { dir } = useDemo();
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  return (
    <FeatureGate feature="parent">
      <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
        <div className="flex h-12 shrink-0 items-center justify-between bg-red-700 px-3">
          <Link href="/demo" className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white">
            <Back className="size-4" />
          </Link>
          <DemoLangToggle />
        </div>
        <div className="min-h-0 flex-1">
          <ParentApp parentId={DEMO_PARENT_ID} withMessages />
        </div>
        <div className="absolute inset-x-0 top-0 z-10">
          <LatestBanner parentId={DEMO_PARENT_ID} />
        </div>
      </div>
    </FeatureGate>
  );
}
