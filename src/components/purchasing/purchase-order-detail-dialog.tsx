"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Dictionary } from "@/i18n/get-dictionary";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
};

export function PurchaseOrderDetailDialog({
  dict,
  currency,
  items,
  total,
}: {
  dict: Dictionary;
  currency: string;
  items: OrderItem[];
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {dict.sales.history.view}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.purchasing.detail.title}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.purchasing.newOrder.products}</TableHead>
              <TableHead>{dict.purchasing.newOrder.quantity}</TableHead>
              <TableHead>{dict.purchasing.newOrder.unitCost}</TableHead>
              <TableHead>{dict.purchasing.newOrder.lineTotal}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {currency} {item.unitCost.toFixed(2)}
                </TableCell>
                <TableCell>
                  {currency} {item.lineTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
          <span>{dict.purchasing.newOrder.total}</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
