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
}: {
  title: string;
  platform: string;
  href: string;
  percent?: number;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{platform}</CardDescription>
      </CardHeader>
      {percent !== undefined && (
        <CardContent>
          <ProgressBar percent={percent} />
        </CardContent>
      )}
      {footer && <CardFooter className="border-t-0 bg-transparent">{footer}</CardFooter>}
    </Card>
  );
}
