"use client";

import { Button } from "@/components/ui/button";
import { useActionFormPending } from "@/components/ui/action-form";

// A submit <Button> for use inside <ActionForm> that disables itself and
// swaps its label while that form's action is pending, without needing the
// pending flag threaded down as a prop from the (often server-rendered)
// parent.
export function SubmitButton({
  children,
  pendingChildren,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { pendingChildren?: React.ReactNode }) {
  const isPending = useActionFormPending();
  return (
    <Button type="submit" disabled={isPending || disabled} {...props}>
      {isPending && pendingChildren ? pendingChildren : children}
    </Button>
  );
}
