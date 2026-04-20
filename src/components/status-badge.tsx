import { Badge, type BadgeProps } from "@/components/ui/badge";

type StatusBadgeProps = {
  label: string;
  tone?: BadgeProps["variant"];
};

export function StatusBadge({
  label,
  tone = "neutral"
}: StatusBadgeProps) {
  return <Badge variant={tone}>{label}</Badge>;
}

