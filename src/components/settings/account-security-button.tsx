"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AccountSecurityButton({ label }: { label: string }) {
  const clerk = useClerk();

  return (
    <Button variant="outline" onClick={() => clerk.openUserProfile()}>
      {label}
    </Button>
  );
}
