"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResetPasswordState } from "@/app/reset-password/actions";

export function ResetPasswordForm({
  action,
  labels,
}: {
  action: (
    state: ResetPasswordState,
    formData: FormData
  ) => Promise<ResetPasswordState>;
  labels: { newPassword: string; submit: string; loading: string };
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{labels.newPassword}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? labels.loading : labels.submit}
      </Button>
    </form>
  );
}
