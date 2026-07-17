"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { ChecklistItemRow } from "@/components/checklist-item-row";
import { ProgressBar } from "@/components/progress-bar";
import { computeCompletionPercent } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  completed: boolean;
};

type Section = {
  id: string;
  title: string;
  items: Item[];
};

export function ChecklistNavigator({
  sections,
  initialSectionId,
  chaptersLabel,
  toggleAction,
}: {
  sections: Section[];
  initialSectionId: string;
  chaptersLabel: string;
  toggleAction: (itemId: string, completed: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = useState(initialSectionId);

  const stats = (items: Item[]) => {
    const done = items.filter((i) => i.completed).length;
    return { done, total: items.length };
  };

  function select(id: string) {
    setActiveId(id);
    // Persist across refresh without moving the scroll position.
    router.replace(`${pathname}?c=${id}`, { scroll: false });
  }

  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  const activeStats = stats(active.items);
  const activePercent = computeCompletionPercent(
    activeStats.total,
    activeStats.done
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {/* Desktop: lateral index */}
      <aside className="hidden md:block md:w-56 md:shrink-0">
        <nav
          aria-label={chaptersLabel}
          className="sticky top-[4.5rem] flex flex-col gap-0.5"
        >
          {sections.map((section) => {
            const { done, total } = stats(section.items);
            const complete = total > 0 && done === total;
            const isActive = section.id === active.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => select(section.id)}
                className={cn(
                  "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="line-clamp-2 leading-snug">{section.title}</span>
                {complete ? (
                  <Check className="size-4 shrink-0 text-success" />
                ) : (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">
                    {done}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: horizontal tab bar */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const { done, total } = stats(section.items);
          const complete = total > 0 && done === total;
          const isActive = section.id === active.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => select(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-primary/40 bg-accent font-medium text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {section.title}
              {complete ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <span className="text-xs tabular-nums opacity-70">
                  {done}/{total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active section */}
      <div className="min-w-0 flex-1">
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-base font-semibold">
                {active.title}
              </h2>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {activeStats.done}/{activeStats.total}
              </span>
            </div>
            <ProgressBar percent={activePercent} />
          </div>
          <div className="flex flex-col divide-y px-4">
            {active.items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                itemId={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                completed={item.completed}
                toggleAction={toggleAction}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
