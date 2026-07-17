"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ChecklistItemRow({
  itemId,
  title,
  description,
  imageUrl,
  completed,
  toggleAction,
}: {
  itemId: string;
  title: string;
  description: string | null;
  imageUrl?: string | null;
  completed: boolean;
  toggleAction: (itemId: string, completed: boolean) => Promise<void>;
}) {
  const [checked, setChecked] = useState(completed);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await toggleAction(itemId, next);
      } catch {
        setChecked(!next);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id={`item-${itemId}`}
          checked={checked}
          disabled={isPending}
          onCheckedChange={handleChange}
          className="mt-0.5"
        />
        <Label
          htmlFor={`item-${itemId}`}
          className={cn(
            "flex flex-col items-start gap-0.5 font-normal",
            checked && "text-muted-foreground line-through"
          )}
        >
          <span>{title}</span>
          {description && (
            <span className="text-xs text-muted-foreground no-underline">
              {description}
            </span>
          )}
        </Label>
      </div>
      {imageUrl && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative ml-8 block aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted"
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-contain"
          />
        </a>
      )}
    </div>
  );
}
