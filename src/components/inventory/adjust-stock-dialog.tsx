"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/lib/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { t } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function AdjustStockDialog({
  dict,
  productId,
  currentStock,
}: {
  dict: Dictionary;
  productId: string;
  currentStock: number;
}) {
  const [open, setOpen] = useState(false);
  const [quantityChange, setQuantityChange] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await adjustStock({ productId, quantityChange: Number(quantityChange), reason });
        setOpen(false);
        setQuantityChange("");
        setReason("");
      } catch (err) {
        setError(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {dict.inventory.adjustStock.trigger}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.inventory.adjustStock.title}</DialogTitle>
          <DialogDescription>{dict.inventory.adjustStock.description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t(dict.inventory.adjustStock.currentStock, { qty: currentStock })}
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="adjust-qty">{dict.inventory.adjustStock.quantityChange}</Label>
            <Input
              id="adjust-qty"
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {dict.inventory.adjustStock.quantityChangeHint}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adjust-reason">{dict.inventory.adjustStock.reason}</Label>
            <Input id="adjust-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? dict.common.saving : dict.common.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
