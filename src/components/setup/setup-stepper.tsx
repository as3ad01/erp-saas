"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/get-dictionary";

export function SetupStepper({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const steps = [
    { href: "/setup", label: dict.setup.steps.profile },
    { href: "/setup/modules", label: dict.setup.steps.modules },
    { href: "/setup/staff", label: dict.setup.steps.staff },
  ];
  const currentIndex = steps.findIndex((s) => s.href === pathname);

  return (
    <ol className="flex items-center gap-3 text-sm">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isDone = currentIndex >= 0 && i < currentIndex;
        return (
          <li key={step.href} className="flex items-center gap-3">
            {i > 0 && <span className="h-px w-6 bg-border" />}
            <span
              className={cn(
                "flex items-center gap-2",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  isCurrent && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/20 text-primary",
                  !isCurrent && !isDone && "bg-muted"
                )}
              >
                {i + 1}
              </span>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
