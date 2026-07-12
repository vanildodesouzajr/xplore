import { ChecklistItemRow } from "@/components/checklist-item-row";
import { ProgressBar } from "@/components/progress-bar";
import { computeCompletionPercent } from "@/lib/progress";

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

export function ChecklistCategorySection({
  title,
  items,
  toggleAction,
}: {
  title: string;
  items: ChecklistItem[];
  toggleAction: (itemId: string, completed: boolean) => Promise<void>;
}) {
  const completedCount = items.filter((item) => item.completed).length;
  const percent = computeCompletionPercent(items.length, completedCount);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {completedCount}/{items.length}
          </span>
        </div>
        <ProgressBar percent={percent} />
      </div>
      <div className="flex flex-col divide-y px-4">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            itemId={item.id}
            title={item.title}
            description={item.description}
            completed={item.completed}
            toggleAction={toggleAction}
          />
        ))}
      </div>
    </section>
  );
}
