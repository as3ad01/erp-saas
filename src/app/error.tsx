"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/demo/components/logo";
import { cn } from "@/lib/utils";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Logo className="size-12" />
      <div>
        <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-1 text-lg font-semibold text-muted-foreground">Something went wrong</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="h-10 px-5 text-base" onClick={() => retry()}>
          حاول مرة أخرى · Try again
        </Button>
        <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-5 text-base")}>
          العودة إلى العرض · Back to the demo
        </Link>
      </div>
    </main>
  );
}
