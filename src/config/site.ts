export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "منصة التخطيط المؤسسي",
  shortName: "منصة التخطيط",
  description:
    "منصة مؤسسية عربية لإدارة التخطيط الديناميكي، مؤشرات الأداء، المتابعة والتقييم، التقارير، والاعتمادات.",
  owner:
    "الإدارة العامة للتخطيط والبحوث - وزارة الخارجية وشؤون المغتربين - الجمهورية اليمنية",
  navigation: [
    { href: "/dashboard", label: "لوحة القيادة" },
    { href: "/plans", label: "الخطط" },
    { href: "/templates", label: "القوالب" },
    { href: "/initiatives", label: "المبادرات والإجراءات" },
    { href: "/kpis", label: "المؤشرات" },
    { href: "/monitoring", label: "المتابعة والتقييم" },
    { href: "/reports", label: "تقارير البعثات" },
    { href: "/training", label: "التدريب والتأهيل" },
    { href: "/knowledge", label: "المعرفة والبحوث" },
    { href: "/approvals", label: "الاعتمادات" },
    { href: "/users", label: "المستخدمون والصلاحيات" },
    { href: "/settings", label: "الإعدادات" }
  ]
} as const;

export type SiteNavigationItem = (typeof siteConfig.navigation)[number];

