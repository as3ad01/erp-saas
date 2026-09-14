"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

// A drop-in replacement for <form action={serverAction}> that adds toast
// feedback. Only use this for actions that don't call redirect() on their
// success path (e.g. the setup wizard's actions) -- redirect() depends on
// throwing internally, and a plain server-action form lets Next's own
// dispatch handle that throw. Routing it through our try/catch here would
// swallow it and misreport it as a failed toast instead of navigating.
export function ActionForm({
  action,
  successMessage,
  errorMessage,
  resetOnSuccess = true,
  onSuccess,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  successMessage?: string;
  errorMessage: string;
  // Turn off for "edit in place" forms (e.g. a profile form keyed to the
  // current server data) where resetting would briefly blank the fields
  // instead of just keeping what the user saved.
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
  className?: string;
  children: (isPending: boolean) => React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
        if (successMessage) toast.success(successMessage);
        if (resetOnSuccess) formRef.current?.reset();
        onSuccess?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : errorMessage);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children(isPending)}
    </form>
  );
}
