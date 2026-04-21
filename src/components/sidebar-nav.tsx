"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Gauge,
  Goal,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldCheck,
  Users,
  Workflow
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/plans": Goal,
  "/templates": Workflow,
  "/initiatives": BriefcaseBusiness,
  "/kpis": LineChart,
  "/monitoring": Gauge,
  "/reports": BookOpen,
  "/training": GraduationCap,
  "/knowledge": BookOpen,
  "/approvals": CheckCircle2,
  "/users": Users,
  "/settings": Settings
};

type SidebarNavProps = {
  notificationCount: number;
};

export function SidebarNav({ notificationCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {siteConfig.navigation.map((item) => {
        const Icon = iconMap[item.href] ?? ShieldCheck;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {item.label}
            </span>
            {item.href === "/approvals" && notificationCount > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs",
                  isActive ? "bg-white/15" : "bg-amber-100 text-amber-700"
                )}
              >
                {notificationCount}
              </span>
            ) : null}
          </Link>
        );
      })}
      <Link
        href="/login"
        className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
      >
        <Bell className="h-4 w-4" />
        تبديل دور العرض
      </Link>
    </nav>
  );
}
