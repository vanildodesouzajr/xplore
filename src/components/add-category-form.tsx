"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditFormState } from "@/app/games/[slug]/edit/actions";

export function AddCategoryForm({
  gameId,
  action,
  labels,
}: {
  gameId: string;
  action: (
    gameId: string,
    state: EditFormState,
    formData: FormData
  ) => Promise<EditFormState>;
  labels: { placeholder: string; add: string; adding: string };
}) {
  const [state, formAction, pending] = useActionState(
    action.bind(null, gameId),
    { error: null }
  );

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1.5">
        <Input name="title" placeholder={labels.placeholder} required />
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? labels.adding : labels.add}
      </Button>
    </form>
  );
}
