"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/lib/actions/inventory";
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

type Category = { id: string; name: string };
type ExistingProduct = {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  costPrice: string;
  sellPrice: string;
  lowStockThreshold: number;
};

const NO_CATEGORY = "__none__";

export function ProductFormDialog({
  dict,
  categories,
  product,
  trigger,
}: {
  dict: Dictionary;
  categories: Category[];
  product?: ExistingProduct;
  trigger: React.ReactElement;
}) {
  const isEdit = !!product;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? NO_CATEGORY);
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? "");
  const [sellPrice, setSellPrice] = useState(product?.sellPrice ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.lowStockThreshold ?? 5)
  );
  const [initialStock, setInitialStock] = useState("0");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const base = {
          name,
          sku,
          categoryId: categoryId === NO_CATEGORY ? null : categoryId,
          costPrice: Number(costPrice),
          sellPrice: Number(sellPrice),
          lowStockThreshold: Number(lowStockThreshold),
        };
        if (isEdit) {
          await updateProduct(product.id, base);
          toast.success(dict.toasts.productUpdated);
        } else {
          await createProduct({ ...base, initialStock: Number(initialStock) });
          toast.success(dict.toasts.productAdded);
        }
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? dict.inventory.editProduct : dict.inventory.addProduct}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">{dict.inventory.fields.name}</Label>
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-sku">{dict.inventory.fields.sku}</Label>
              <Input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-category">{dict.inventory.fields.category}</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v as string)}>
              <SelectTrigger id="p-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>{dict.inventory.fields.noCategory}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-cost">{dict.inventory.fields.costPrice}</Label>
              <Input
                id="p-cost"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-price">{dict.inventory.fields.sellPrice}</Label>
              <Input
                id="p-price"
                type="number"
                step="0.01"
                min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-threshold">{dict.inventory.fields.lowStockThreshold}</Label>
              <Input
                id="p-threshold"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
              />
            </div>
            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="p-initial">{dict.inventory.fields.initialStock}</Label>
                <Input
                  id="p-initial"
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </div>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? dict.common.saving : dict.common.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
