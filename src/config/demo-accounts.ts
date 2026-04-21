export type DemoAccount = {
  userId: string;
  username: string;
  password: string;
  audienceAr: string;
  flowAr: string;
};

export const demoAccounts = [
  {
    userId: "user-dg",
    username: "dg",
    password: "Dg@2026",
    audienceAr: "القيادة العليا",
    flowAr: "لوحة القيادة، الاعتمادات، مؤشرات الأداء والتنبيهات التنفيذية"
  },
  {
    userId: "user-admin",
    username: "admin",
    password: "Admin@2026",
    audienceAr: "مسؤول النظام",
    flowAr: "المستخدمون والصلاحيات، الإعدادات، القوالب وسجل النشاط"
  },
  {
    userId: "user-plan-manager",
    username: "plan.manager",
    password: "Manager@2026",
    audienceAr: "مدير إدارة التخطيط",
    flowAr: "مراجعة الخطط، إرسال الاعتمادات، تقارير البعثات وسير العمل"
  },
  {
    userId: "user-monitor-manager",
    username: "monitor.manager",
    password: "MonitorMgr@2026",
    audienceAr: "مدير إدارة المتابعة",
    flowAr: "مراجعة دورات المتابعة واعتماد الإجراءات التصحيحية"
  },
  {
    userId: "user-planner-1",
    username: "planner1",
    password: "Planner@2026",
    audienceAr: "محلل التخطيط",
    flowAr: "إنشاء الخطط من القوالب وبناء شجرة الخطة وربط المؤشرات"
  },
  {
    userId: "user-planner-2",
    username: "planner2",
    password: "Planner@2026",
    audienceAr: "محلل تخطيط",
    flowAr: "تحديث القوالب، مراجعة مؤشرات الخطة ومكتبة المعرفة"
  },
  {
    userId: "user-monitor-1",
    username: "monitor1",
    password: "Monitor@2026",
    audienceAr: "مسؤول المتابعة",
    flowAr: "دورات المتابعة، تحديثات التقدم، العوائق والإجراءات التصحيحية"
  },
  {
    userId: "user-training-1",
    username: "training1",
    password: "Training@2026",
    audienceAr: "مسؤول التدريب",
    flowAr: "فرص التدريب، الترشيحات، الاعتماد الإداري ومتابعة المشاركة"
  },
  {
    userId: "user-riyadh-1",
    username: "riyadh1",
    password: "Mission@2026",
    audienceAr: "مستخدم بعثة",
    flowAr: "رفع تقارير البعثات واستعراض الملاحظات وحالة الإرجاع"
  },
  {
    userId: "user-riyadh-2",
    username: "riyadh2",
    password: "Mission@2026",
    audienceAr: "مستخدم بعثة",
    flowAr: "متابعة وثائق المعرفة وربط التقارير بالمبادرات"
  },
  {
    userId: "user-cairo-1",
    username: "cairo1",
    password: "Mission@2026",
    audienceAr: "مستخدم بعثة",
    flowAr: "استكمال التقارير المعادة ومراجعة تعليقات الإدارة"
  },
  {
    userId: "user-reader",
    username: "reader",
    password: "Reader@2026",
    audienceAr: "قارئ فقط",
    flowAr: "استعراض اللوحات والوثائق دون تنفيذ إجراءات حساسة"
  }
] as const satisfies readonly DemoAccount[];

export const demoAccountByUserId = Object.fromEntries(
  demoAccounts.map((account) => [account.userId, account])
) as Record<string, DemoAccount>;
