"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ForgotPasswordState } from "@/app/forgot-password/actions";

export function ForgotPasswordForm({
  action,
  labels,
}: {
  action: (
    state: ForgotPasswordState,
    formData: FormData
  ) => Promise<ForgotPasswordState>;
  labels: { email: string; submit: string; loading: string };
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
    message: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? labels.loading : labels.submit}
      </Button>
    </form>
  );
}
