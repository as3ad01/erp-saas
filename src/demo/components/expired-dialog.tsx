"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { relDays } from "../format";
import { fmt } from "../i18n";
import { useDemo } from "../state";
import type { Member } from "../data";
import { useRetained } from "../use-retained";

/** Asks the coach to confirm before checking in a member whose subscription has expired. */
export function ExpiredCheckInDialog({
  member: memberProp,
  onCancel,
  onConfirm,
}: {
  member: Member | null;
  onCancel: () => void;
  onConfirm: (m: Member) => void;
}) {
  const { d, L, lang } = useDemo();
  const member = useRetained(memberProp);
  return (
    <Dialog open={!!memberProp} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        {member && (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                <TriangleAlert className="size-5" />
              </div>
              <DialogTitle>{d.checkin.expiredTitle}</DialogTitle>
              <DialogDescription>
                {fmt(d.checkin.expiredBody, {
                  name: L(member.name),
                  when: relDays(member.expiresInDays, lang),
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={onCancel}>
                {d.common.cancel}
              </Button>
              <Button onClick={() => onConfirm(member)}>{d.checkin.anyway}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
