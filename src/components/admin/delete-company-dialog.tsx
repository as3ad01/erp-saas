"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCompany } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function DeleteCompanyDialog({
  companyId,
  companyName,
  dict,
}: {
  companyId: string;
  companyName: string;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const confirmTarget = companyName || "DELETE";
  const canDelete = confirmText === confirmTarget;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCompany(companyId);
        toast.success(dict.toasts.companyDeleted);
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : dict.common.somethingWentWrong);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            {dict.common.delete}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(dict.admin.deleteDialog.title, {
              name: companyName || dict.admin.deleteDialog.fallbackName,
            })}
          </DialogTitle>
          <DialogDescription>
            {t(dict.admin.deleteDialog.description, { target: confirmTarget })}
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={confirmTarget}
        />
        <Button
          variant="destructive"
          disabled={!canDelete || isPending}
          onClick={handleDelete}
          className="w-fit"
        >
          {isPending ? dict.admin.deleteDialog.deleting : dict.admin.deleteDialog.confirm}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
