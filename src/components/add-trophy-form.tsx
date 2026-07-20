"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EditFormState } from "@/app/games/[slug]/edit/actions";

export function AddTrophyForm({
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
  labels: {
    titlePlaceholder: string;
    descPlaceholder: string;
    tierLabel: string;
    tiers: { bronze: string; silver: string; gold: string; platinum: string };
    add: string;
    adding: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    action.bind(null, gameId),
    { error: null }
  );

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1.5">
        <Input name="title" placeholder={labels.titlePlaceholder} required />
        <Input name="description" placeholder={labels.descPlaceholder} />
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>
      <select
        name="tier"
        aria-label={labels.tierLabel}
        defaultValue="bronze"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <option value="bronze">{labels.tiers.bronze}</option>
        <option value="silver">{labels.tiers.silver}</option>
        <option value="gold">{labels.tiers.gold}</option>
        <option value="platinum">{labels.tiers.platinum}</option>
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? labels.adding : labels.add}
      </Button>
    </form>
  );
}
