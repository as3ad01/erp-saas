"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelPurchaseOrder } from "@/lib/actions/purchasing";
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

export function CancelOrderDialog({
  dict,
  purchaseOrderId,
}: {
  dict: Dictionary;
  purchaseOrderId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await cancelPurchaseOrder(purchaseOrderId);
        toast.success(dict.toasts.orderCanceled);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {dict.purchasing.cancel.trigger}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.purchasing.cancel.confirmTitle}</DialogTitle>
          <DialogDescription>{dict.purchasing.cancel.confirmDescription}</DialogDescription>
        </DialogHeader>
        <Button disabled={isPending} onClick={handleConfirm} className="w-fit">
          {isPending ? dict.purchasing.cancel.canceling : dict.purchasing.cancel.confirm}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
