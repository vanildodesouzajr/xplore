"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGameAction, type CreateGameState } from "../actions";

const initialState: CreateGameState = { error: null };

export default function NewGamePage() {
  const [state, formAction, pending] = useActionState(
    createGameAction,
    initialState
  );

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">New game</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="platform">Platform</Label>
          <Input id="platform" name="platform" required placeholder="PS5, Switch, PC..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cover_url">Cover image URL (optional)</Label>
          <Input id="cover_url" name="cover_url" type="url" />
        </div>
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create game"}
        </Button>
      </form>
    </div>
  );
}
