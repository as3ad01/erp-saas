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

type SaleItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export function SaleDetailDialog({
  dict,
  currency,
  items,
  total,
}: {
  dict: Dictionary;
  currency: string;
  items: SaleItem[];
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
          <DialogTitle>{dict.sales.saleDetail.title}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.sales.history.items}</TableHead>
              <TableHead>{dict.sales.pos.quantity}</TableHead>
              <TableHead>{dict.sales.saleDetail.unitPrice}</TableHead>
              <TableHead>{dict.sales.saleDetail.lineTotal}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {currency} {item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell>
                  {currency} {item.lineTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
          <span>{dict.sales.pos.total}</span>
          <span>
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
