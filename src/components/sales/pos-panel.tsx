"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createSale } from "@/lib/actions/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PaymentMethod } from "@/generated/prisma/enums";

type Product = {
  id: string;
  name: string;
  sku: string;
  sellPrice: string;
  stockQty: number;
};

type Customer = { id: string; name: string };

type CartLine = {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  stockQty: number;
};

const WALK_IN = "__walk_in__";

export function POSPanel({
  dict,
  products,
  customers,
  currency,
}: {
  dict: Dictionary;
  products: Product[];
  customers: Customer[];
  currency: string;
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(WALK_IN);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [completed, setCompleted] = useState<{ total: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) return prev;
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      if (product.stockQty <= 0) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: Number(product.sellPrice),
          quantity: 1,
          stockQty: product.stockQty,
        },
      ];
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stockQty)) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  function handleCompleteSale() {
    startTransition(async () => {
      try {
        const result = await createSale({
          items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          customerId: customerId === WALK_IN ? null : customerId,
          paymentMethod,
        });
        setCompleted({ total: result.total });
        setCart([]);
        setCustomerId(WALK_IN);
        setPaymentMethod("CASH");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  if (completed) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{dict.sales.pos.saleCompleted}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">
            {t(dict.sales.pos.saleCompletedDescription, {
              total: `${currency} ${completed.total.toFixed(2)}`,
            })}
          </p>
          <Button onClick={() => setCompleted(null)}>{dict.sales.pos.newSale}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{dict.sales.pos.products}</CardTitle>
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.sales.pos.searchPlaceholder}
              className="ps-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => {
              const inCartQty = cart.find((l) => l.productId === p.id)?.quantity ?? 0;
              const outOfStock = p.stockQty <= inCartQty;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => addToCart(p)}
                  className="flex flex-col items-start gap-1 rounded-lg border border-input p-3 text-start transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.sku}</span>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm">
                      {currency} {Number(p.sellPrice).toFixed(2)}
                    </span>
                    {outOfStock ? (
                      <Badge variant="outline">{dict.sales.pos.outOfStock}</Badge>
                    ) : (
                      <Badge variant="secondary">{p.stockQty}</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.sales.pos.cart}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.sales.pos.cartEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {cart.map((line) => (
                <li key={line.productId} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{line.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.productId)}
                      aria-label={dict.sales.pos.remove}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={line.quantity >= line.stockQty}
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <span className="text-sm">
                      {currency} {(line.unitPrice * line.quantity).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{dict.sales.pos.customer}</label>
            <Select value={customerId} onValueChange={(v) => setCustomerId(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WALK_IN}>{dict.sales.pos.walkIn}</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{dict.sales.pos.paymentMethod}</label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">{dict.sales.paymentMethods.CASH}</SelectItem>
                <SelectItem value="CARD">{dict.sales.paymentMethods.CARD}</SelectItem>
                <SelectItem value="OTHER">{dict.sales.paymentMethods.OTHER}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
            <span>{dict.sales.pos.total}</span>
            <span>
              {currency} {total.toFixed(2)}
            </span>
          </div>

          <Button
            className="w-full"
            disabled={cart.length === 0 || isPending}
            onClick={handleCompleteSale}
          >
            {isPending ? dict.sales.pos.processing : dict.sales.pos.completeSale}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
