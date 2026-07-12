"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileState } from "@/app/account/actions";

export function ProfileForm({
  action,
  defaultDisplayName,
  defaultAvatarUrl,
  labels,
}: {
  action: (state: ProfileState, formData: FormData) => Promise<ProfileState>;
  defaultDisplayName: string;
  defaultAvatarUrl: string;
  labels: {
    displayName: string;
    avatarUrl: string;
    save: string;
    saving: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
    message: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">{labels.displayName}</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={defaultDisplayName}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="avatar_url">{labels.avatarUrl}</Label>
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={defaultAvatarUrl}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? labels.saving : labels.save}
      </Button>
    </form>
  );
}
