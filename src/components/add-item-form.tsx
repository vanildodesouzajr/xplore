"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditFormState } from "@/app/games/[slug]/edit/actions";

export function AddItemForm({
  categoryId,
  action,
}: {
  categoryId: string;
  action: (
    categoryId: string,
    state: EditFormState,
    formData: FormData
  ) => Promise<EditFormState>;
}) {
  const [state, formAction, pending] = useActionState(
    action.bind(null, categoryId),
    { error: null }
  );

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1.5">
        <Input name="title" placeholder="Item title" required />
        <Input name="description" placeholder="Description (optional)" />
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Adding…" : "Add item"}
      </Button>
    </form>
  );
}
