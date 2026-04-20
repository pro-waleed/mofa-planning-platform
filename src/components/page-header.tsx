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
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
          <h1 className="text-2xl font-bold text-dashboard-ink md:text-3xl">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
