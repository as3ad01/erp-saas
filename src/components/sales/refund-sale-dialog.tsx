"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { refundSale } from "@/lib/actions/sales";
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

export function RefundSaleDialog({ dict, saleId }: { dict: Dictionary; saleId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await refundSale(saleId);
        toast.success(dict.toasts.saleRefunded);
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
            {dict.sales.refund.trigger}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.sales.refund.confirmTitle}</DialogTitle>
          <DialogDescription>{dict.sales.refund.confirmDescription}</DialogDescription>
        </DialogHeader>
        <Button disabled={isPending} onClick={handleConfirm} className="w-fit">
          {isPending ? dict.sales.refund.refunding : dict.sales.refund.confirm}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
