export function HltbStats({
  title,
  mainStoryLabel,
  mainExtraLabel,
  completionistLabel,
  mainHours,
  mainExtraHours,
  completionistHours,
}: {
  title: string;
  mainStoryLabel: string;
  mainExtraLabel: string;
  completionistLabel: string;
  mainHours: number | null;
  mainExtraHours: number | null;
  completionistHours: number | null;
}) {
  const stats = [
    { label: mainStoryLabel, hours: mainHours },
    { label: mainExtraLabel, hours: mainExtraHours },
    { label: completionistLabel, hours: completionistHours },
  ].filter((stat): stat is { label: string; hours: number } => stat.hours != null);

  if (stats.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className="font-heading text-xl font-semibold tabular-nums">
              {stat.hours}
              <span className="text-sm text-muted-foreground">h</span>
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
