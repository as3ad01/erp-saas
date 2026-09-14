"use client";

import { useMemo, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createPurchaseOrder } from "@/lib/actions/purchasing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/i18n/get-dictionary";

type Product = { id: string; name: string; sku: string; costPrice: string };
type Supplier = { id: string; name: string };

type Line = {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
};

export function NewPurchaseOrderDialog({
  dict,
  currency,
  suppliers,
  products,
}: {
  dict: Dictionary;
  currency: string;
  suppliers: Supplier[];
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 20);
  }, [products, search]);

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

  function addLine(product: Product) {
    setLines((prev) => {
      if (prev.some((l) => l.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity: 1,
          unitCost: Number(product.costPrice),
        },
      ];
    });
  }

  function updateLine(productId: string, patch: Partial<Pick<Line, "quantity" | "unitCost">>) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function reset() {
    setSupplierId("");
    setSearch("");
    setLines([]);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createPurchaseOrder({
          supplierId,
          items: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitCost: l.unitCost,
          })),
        });
        setOpen(false);
        reset();
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
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button>{dict.purchasing.newOrder.trigger}</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dict.purchasing.newOrder.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="po-supplier">{dict.purchasing.newOrder.supplier}</Label>
            <Select value={supplierId} onValueChange={(v) => setSupplierId(v as string)}>
              <SelectTrigger id="po-supplier" className="w-full">
                <SelectValue placeholder={dict.purchasing.newOrder.selectSupplier} />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="po-search">{dict.purchasing.newOrder.products}</Label>
            <Input
              id="po-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.purchasing.newOrder.searchPlaceholder}
            />
            <div className="max-h-32 overflow-y-auto rounded-lg border border-input">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addLine(p)}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 text-start text-sm hover:bg-accent"
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.sku}</span>
                </button>
              ))}
            </div>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.purchasing.newOrder.itemsEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-sm">{line.name}</span>
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.productId, { quantity: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-16"
                    aria-label={dict.purchasing.newOrder.quantity}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitCost}
                    onChange={(e) =>
                      updateLine(line.productId, { unitCost: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-24"
                    aria-label={dict.purchasing.newOrder.unitCost}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(line.productId)}
                    aria-label={dict.purchasing.newOrder.remove}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>{dict.purchasing.newOrder.total}</span>
            <span>
              {currency} {total.toFixed(2)}
            </span>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={!supplierId || lines.length === 0 || isPending}>
            {isPending ? dict.purchasing.newOrder.creating : dict.purchasing.newOrder.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
