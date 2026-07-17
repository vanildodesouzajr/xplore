import { cn } from "@/lib/utils";

/**
 * Shared page-body wrapper. Its width band (max-w-5xl) and horizontal gutter
 * (px-4) MUST match the header container in `site-header.tsx` so every page
 * lines up with the header on both desktop and mobile. The header is the
 * source of truth — if its width changes, change it here too.
 */
export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6",
        className
      )}
    >
      {children}
    </div>
  );
}
