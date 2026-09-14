"use client";

import { useState, useTransition } from "react";
import { receivePurchaseOrder } from "@/lib/actions/purchasing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Dictionary } from "@/i18n/get-dictionary";

export function ReceiveOrderDialog({
  dict,
  purchaseOrderId,
}: {
  dict: Dictionary;
  purchaseOrderId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await receivePurchaseOrder(purchaseOrderId);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {dict.purchasing.receive.trigger}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.purchasing.receive.confirmTitle}</DialogTitle>
          <DialogDescription>{dict.purchasing.receive.confirmDescription}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={isPending} onClick={handleConfirm} className="w-fit">
          {isPending ? dict.purchasing.receive.receiving : dict.purchasing.receive.confirm}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
