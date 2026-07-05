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
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{items.length}
        </span>
      </div>
      <ProgressBar percent={percent} />
      <div className="flex flex-col divide-y">
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
