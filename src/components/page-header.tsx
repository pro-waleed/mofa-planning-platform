import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: Route;
  backHref?: Route;
};

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  backHref
}: PageHeaderProps) {
  return (
    <div className="hero-panel flex flex-col gap-5 rounded-[32px] border border-white/70 p-6 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
          <div className="space-y-1">
            <p className="executive-kicker">مسار مؤسسي</p>
            <h1 className="text-2xl font-bold text-dashboard-ink md:text-3xl">
              {title}
            </h1>
          </div>
        </div>
        {description ? (
          <p className="max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Button asChild size="lg" className="shrink-0">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
