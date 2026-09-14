"use client";

import { useState, useTransition } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await refundSale(saleId);
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
            {dict.sales.refund.trigger}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.sales.refund.confirmTitle}</DialogTitle>
          <DialogDescription>{dict.sales.refund.confirmDescription}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={isPending} onClick={handleConfirm} className="w-fit">
          {isPending ? dict.sales.refund.refunding : dict.sales.refund.confirm}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
