import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={percent} className="flex-1" />
      <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
        {percent}%
      </span>
    </div>
  );
}
