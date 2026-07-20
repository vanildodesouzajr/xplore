import { TrophyRow } from "@/components/trophy-row";
import { ProgressBar } from "@/components/progress-bar";
import { computeCompletionPercent } from "@/lib/progress";

type Trophy = {
  id: string;
  title: string;
  description: string | null;
  tier: string;
  completed: boolean;
};

export function TrophyList({
  trophies,
  toggleAction,
  progressLabel,
}: {
  trophies: Trophy[];
  toggleAction: (trophyId: string, completed: boolean) => Promise<void>;
  progressLabel: string;
}) {
  const done = trophies.filter((trophy) => trophy.completed).length;
  const percent = computeCompletionPercent(trophies.length, done);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-base font-semibold">{progressLabel}</h2>
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {done}/{trophies.length}
          </span>
        </div>
        <ProgressBar percent={percent} />
      </div>
      <div className="flex flex-col divide-y px-4">
        {trophies.map((trophy) => (
          <TrophyRow
            key={trophy.id}
            trophyId={trophy.id}
            title={trophy.title}
            description={trophy.description}
            tier={trophy.tier}
            completed={trophy.completed}
            toggleAction={toggleAction}
          />
        ))}
      </div>
    </section>
  );
}
