export const permissionLabels: Record<string, string> = {
  "*": "صلاحيات كاملة",
  "dashboard.read": "قراءة لوحة القيادة",
  "plans.approve": "اعتماد الخطط",
  "plans.review": "مراجعة الخطط",
  "plans.submit": "رفع الخطط",
  "plans.create": "إنشاء الخطط",
  "plans.edit": "تحرير الخطط",
  "plans.read": "قراءة الخطط",
  "templates.manage": "إدارة القوالب",
  "approvals.decide": "اتخاذ قرارات الاعتماد",
  "reports.review": "مراجعة التقارير",
  "reports.create": "إنشاء التقارير",
  "reports.edit_own": "تعديل تقاريره",
  "reports.read": "قراءة التقارير",
  "kpis.manage": "إدارة المؤشرات",
  "kpis.update": "تحديث المؤشرات",
  "kpis.read": "قراءة المؤشرات",
  "monitoring.manage": "إدارة المتابعة",
  "monitoring.submit": "رفع تحديثات المتابعة",
  "initiatives.update": "تحديث المبادرات",
  "training.manage": "إدارة التدريب",
  "training.approve": "اعتماد الترشيحات",
  "training.nominations.review": "مراجعة الترشيحات",
  "training.nominate_self": "طلب ترشيح تدريبي",
  "knowledge.manage": "إدارة المعرفة",
  "knowledge.read": "قراءة المعرفة",
  "audit.read": "قراءة سجل النشاط",
  "users.manage": "إدارة المستخدمين",
  "roles.manage": "إدارة الأدوار والصلاحيات",
  "settings.manage": "إدارة الإعدادات"
};

export const rolePermissionDefaults = {
  SYSTEM_ADMIN: ["*", "users.manage", "roles.manage", "settings.manage"],
  DIRECTOR_GENERAL: [
    "dashboard.read",
    "plans.approve",
    "approvals.decide",
    "reports.review",
    "kpis.read",
    "audit.read"
  ],
  DEPARTMENT_MANAGER: [
    "dashboard.read",
    "plans.review",
    "plans.submit",
    "approvals.decide",
    "reports.review",
    "training.approve"
  ],
  PLANNING_ANALYST: [
    "templates.manage",
    "plans.create",
    "plans.edit",
    "kpis.manage",
    "knowledge.manage"
  ],
  MONITORING_OFFICER: [
    "monitoring.manage",
    "monitoring.submit",
    "initiatives.update",
    "kpis.update",
    "reports.read"
  ],
  TRAINING_OFFICER: [
    "training.manage",
    "training.nominations.review",
    "knowledge.manage",
    "reports.read"
  ],
  MISSION_USER: [
    "reports.create",
    "reports.edit_own",
    "training.nominate_self",
    "knowledge.read"
  ],
  READ_ONLY: [
    "dashboard.read",
    "plans.read",
    "reports.read",
    "kpis.read",
    "knowledge.read"
  ]
} as const;

export function permissionsFromJson(permissions: unknown) {
  if (!Array.isArray(permissions)) return [];

  return permissions.filter(
    (permission): permission is string => typeof permission === "string"
  );
}

export function getPermissionLabels(permissions: unknown) {
  return permissionsFromJson(permissions).map(
    (permission) => permissionLabels[permission] ?? permission
  );
}

export function hasPermission(
  user: { role: { permissions: unknown } },
  permission: string
) {
  const permissions = permissionsFromJson(user.role.permissions);

  return permissions.includes("*") || permissions.includes(permission);
}
