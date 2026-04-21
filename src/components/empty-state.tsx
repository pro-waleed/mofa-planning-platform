import type { Route } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: Route;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/80 bg-white/75">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <PlusCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-dashboard-ink">{title}</h3>
          <p className="max-w-md text-sm leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
        {actionHref && actionLabel ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
