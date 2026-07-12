"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGameAction, type CreateGameState } from "@/app/games/actions";

const initialState: CreateGameState = { error: null };

export function NewGameForm({
  labels,
}: {
  labels: {
    title: string;
    platform: string;
    platformPlaceholder: string;
    coverUrl: string;
    submit: string;
    submitting: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    createGameAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border bg-card p-5"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">{labels.title}</Label>
        <Input id="title" name="title" required autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="platform">{labels.platform}</Label>
        <Input
          id="platform"
          name="platform"
          required
          placeholder={labels.platformPlaceholder}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cover_url">{labels.coverUrl}</Label>
        <Input id="cover_url" name="cover_url" type="url" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
