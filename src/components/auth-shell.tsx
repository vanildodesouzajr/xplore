import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Link href="/dashboard" aria-label="Xplore">
            <Image
              src="/icon-512.png"
              alt=""
              width={60}
              height={60}
              priority
              className="rounded-2xl shadow-lg ring-1 ring-border"
            />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-foreground/[0.03]">
          {children}
        </div>
        {footer && (
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
