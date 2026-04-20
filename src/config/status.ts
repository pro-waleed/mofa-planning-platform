export const statusMeta = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  ACTIVE: { label: "نشط", tone: "success" },
  ARCHIVED: { label: "مؤرشف", tone: "neutral" },
  SUBMITTED: { label: "مرفوع", tone: "warning" },
  UNDER_REVIEW: { label: "قيد المراجعة", tone: "warning" },
  APPROVED: { label: "معتمد", tone: "success" },
  RETURNED: { label: "مُعاد", tone: "danger" },
  AT_RISK: { label: "متعثّر", tone: "danger" },
  COMPLETED: { label: "مكتمل", tone: "success" },
  ON_HOLD: { label: "معلق", tone: "warning" },
  HEALTHY: { label: "صحي", tone: "success" },
  WATCH: { label: "يتطلب متابعة", tone: "warning" },
  CRITICAL: { label: "حرج", tone: "danger" },
  PLANNED: { label: "مخطط", tone: "neutral" },
  OPEN: { label: "مفتوح", tone: "success" },
  IN_REVIEW: { label: "قيد المراجعة", tone: "warning" },
  REJECTED: { label: "مرفوض", tone: "danger" },
  PENDING: { label: "بانتظار الإجراء", tone: "warning" },
  NOMINATION_CLOSED: { label: "أُغلق الترشيح", tone: "neutral" },
  IN_PROGRESS: { label: "قيد التنفيذ", tone: "warning" },
  PENDING_MANAGER_APPROVAL: { label: "بانتظار اعتماد المدير", tone: "warning" },
  WITHDRAWN: { label: "منسحب", tone: "neutral" },
  REGISTERED: { label: "مسجل", tone: "neutral" },
  ATTENDED: { label: "حضر", tone: "success" },
  NO_SHOW: { label: "لم يحضر", tone: "danger" },
  UNREAD: { label: "غير مقروء", tone: "warning" },
  READ: { label: "مقروء", tone: "neutral" },
  SUSPENDED: { label: "موقوف", tone: "danger" },
  INACTIVE: { label: "غير نشط", tone: "neutral" }
} as const;

export function getStatusMeta(status?: string | null) {
  if (!status) {
    return { label: "غير محدد", tone: "neutral" as const };
  }

  return statusMeta[status as keyof typeof statusMeta] ?? {
    label: status,
    tone: "neutral" as const
  };
}

