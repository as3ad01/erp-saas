"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePendingSignupEmail } from "@/lib/actions/admin";
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
import type { Dictionary } from "@/i18n/get-dictionary";

export function EditPendingEmailDialog({
  authorizedSignupId,
  currentEmail,
  dict,
}: {
  authorizedSignupId: string;
  currentEmail: string;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updatePendingSignupEmail(authorizedSignupId, email);
        toast.success(dict.toasts.signupEmailUpdated);
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
            {dict.common.edit}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.admin.editDialog.title}</DialogTitle>
          <DialogDescription>{dict.admin.editDialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">{dict.common.email}</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? dict.common.saving : dict.common.save}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
