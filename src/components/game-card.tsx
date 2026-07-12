import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";

export function GameCard({
  title,
  platform,
  href,
  percent,
  footer,
  completeLabel,
}: {
  title: string;
  platform: string;
  href: string;
  percent?: number;
  footer?: React.ReactNode;
  completeLabel?: string;
}) {
  const complete = percent === 100;

  return (
    <Card className="relative transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-within:ring-primary/40">
      <CardHeader>
        <CardTitle>
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {platform}
          </span>
          {complete && completeLabel && (
            <span className="inline-flex items-center rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success">
              {completeLabel}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      {percent !== undefined && (
        <CardContent>
          <ProgressBar percent={percent} />
        </CardContent>
      )}
      {footer && (
        <CardFooter className="relative z-10 border-t-0 bg-transparent pt-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
