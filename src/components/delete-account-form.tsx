"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { DeleteAccountState } from "@/app/account/actions";

export function DeleteAccountForm({
  action,
  labels,
}: {
  action: (
    state: DeleteAccountState,
    formData: FormData
  ) => Promise<DeleteAccountState>;
  labels: { delete: string; deleting: string; confirm: string };
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(labels.confirm)) {
          event.preventDefault();
        }
      }}
    >
      {state.error && (
        <p className="mb-2 text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? labels.deleting : labels.delete}
      </Button>
    </form>
  );
}
