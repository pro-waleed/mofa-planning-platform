import { PrismaClient } from "@prisma/client";

import { demoAccountByUserId } from "../src/config/demo-accounts";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const d = (value: string) => new Date(value);

function loginFields(userId: string) {
  const account = demoAccountByUserId[userId];

  if (!account) {
    throw new Error(`Missing demo credentials for ${userId}`);
  }

  return {
    username: account.username,
    passwordHash: hashPassword(account.password),
    passwordUpdatedAt: d("2026-04-01T00:00:00Z")
  };
}

async function main() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.approvalRequest.deleteMany(),
    prisma.missionReportComment.deleteMany(),
    prisma.monitoringUpdate.deleteMany(),
    prisma.trainingParticipation.deleteMany(),
    prisma.trainingNomination.deleteMany(),
    prisma.knowledgeDocument.deleteMany(),
    prisma.initiative.deleteMany(),
    prisma.planNodeKPI.deleteMany(),
    prisma.kPI.deleteMany(),
    prisma.planNode.deleteMany(),
    prisma.monitoringCycle.deleteMany(),
    prisma.missionReport.deleteMany(),
    prisma.trainingProgram.deleteMany(),
    prisma.plan.deleteMany(),
    prisma.templateField.deleteMany(),
    prisma.templateLevel.deleteMany(),
    prisma.template.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.organizationalUnit.deleteMany()
  ]);

  await prisma.role.createMany({
    data: [
      {
        id: "role-admin",
        code: "SYSTEM_ADMIN",
        permissions: ["*"],
        nameAr: "مسؤول النظام",
        description: "يدير إعدادات النظام والصلاحيات والتهيئة العامة."
      },
      {
        id: "role-dg",
        code: "DIRECTOR_GENERAL",
        permissions: [
          "dashboard.read",
          "plans.approve",
          "approvals.decide",
          "reports.review",
          "kpis.read",
          "audit.read"
        ],
        nameAr: "مدير عام",
        description: "يطلع على المؤشرات التنفيذية ويعتمد المسارات الرئيسية."
      },
      {
        id: "role-manager",
        code: "DEPARTMENT_MANAGER",
        permissions: [
          "dashboard.read",
          "plans.review",
          "plans.submit",
          "approvals.decide",
          "reports.review",
          "training.approve"
        ],
        nameAr: "مدير إدارة",
        description: "يقود الاعتمادات ويراجع الخطط والمبادرات المرتبطة بإدارته."
      },
      {
        id: "role-planner",
        code: "PLANNING_ANALYST",
        permissions: [
          "templates.manage",
          "plans.create",
          "plans.edit",
          "kpis.manage",
          "knowledge.manage"
        ],
        nameAr: "محلل تخطيط",
        description: "يبني القوالب والخطط ويحلل مؤشرات الأداء."
      },
      {
        id: "role-monitor",
        code: "MONITORING_OFFICER",
        permissions: [
          "monitoring.manage",
          "monitoring.submit",
          "initiatives.update",
          "kpis.update",
          "reports.read"
        ],
        nameAr: "مسؤول متابعة",
        description: "يدير دورات المتابعة والتقييم ويراجع التقدم والعوائق."
      },
      {
        id: "role-training",
        code: "TRAINING_OFFICER",
        permissions: [
          "training.manage",
          "training.nominations.review",
          "knowledge.manage",
          "reports.read"
        ],
        nameAr: "مسؤول تدريب",
        description: "ينشر فرص التدريب ويتابع الترشيحات والمخرجات."
      },
      {
        id: "role-mission",
        code: "MISSION_USER",
        permissions: [
          "reports.create",
          "reports.edit_own",
          "training.nominate_self",
          "knowledge.read"
        ],
        nameAr: "مستخدم بعثة",
        description: "يرفع تقارير البعثات الدورية ويتابع الملاحظات."
      },
      {
        id: "role-reader",
        code: "READ_ONLY",
        permissions: [
          "dashboard.read",
          "plans.read",
          "reports.read",
          "kpis.read",
          "knowledge.read"
        ],
        nameAr: "قارئ فقط",
        description: "صلاحية اطلاع للملفات والتقارير دون تعديل."
      }
    ]
  });

  await prisma.organizationalUnit.createMany({
    data: [
      {
        id: "ou-planning",
        code: "GDPR",
        nameAr: "الإدارة العامة للتخطيط والبحوث",
        description: "الجهة المالكة للمنصة ومسؤولة عن التخطيط المؤسسي والبحوث.",
        level: 1
      },
      {
        id: "ou-monitoring",
        code: "MEU",
        nameAr: "إدارة المتابعة والتقييم",
        description: "تقود دورات المتابعة وإدارة المؤشرات والتحسينات التصحيحية.",
        level: 2,
        parentId: "ou-planning"
      },
      {
        id: "ou-training",
        code: "TCB",
        nameAr: "إدارة التدريب والتأهيل",
        description: "تدير فرص التدريب وبناء القدرات وقياس الأثر.",
        level: 2,
        parentId: "ou-planning"
      },
      {
        id: "ou-riyadh",
        code: "MISSION-RUH",
        nameAr: "بعثة اليمن - الرياض",
        description: "بعثة دبلوماسية معنية بالتقارير الدورية والدعم القنصلي.",
        level: 2
      },
      {
        id: "ou-cairo",
        code: "MISSION-CAI",
        nameAr: "بعثة اليمن - القاهرة",
        description: "بعثة دبلوماسية معنية بالتقارير السياسية والتعليمية والثقافية.",
        level: 2
      }
    ]
  });

  await prisma.user.createMany({
    data: [
      {
        id: "user-admin",
        ...loginFields("user-admin"),
        email: "admin@mofa.ye",
        fullNameAr: "سامي عبدالله الشامي",
        titleAr: "مدير الأنظمة المؤسسية",
        roleId: "role-admin",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T09:00:00Z")
      },
      {
        id: "user-dg",
        ...loginFields("user-dg"),
        email: "dg@mofa.ye",
        fullNameAr: "د. نهى عبدالكريم القباطي",
        titleAr: "المدير العام للتخطيط والبحوث",
        roleId: "role-dg",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T07:30:00Z")
      },
      {
        id: "user-plan-manager",
        ...loginFields("user-plan-manager"),
        email: "plan.manager@mofa.ye",
        fullNameAr: "خالد يحيى النعمان",
        titleAr: "مدير إدارة التخطيط",
        roleId: "role-manager",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T08:10:00Z")
      },
      {
        id: "user-monitor-manager",
        ...loginFields("user-monitor-manager"),
        email: "monitor.manager@mofa.ye",
        fullNameAr: "هدى عبدالسلام سنان",
        titleAr: "مدير إدارة المتابعة والتقييم",
        roleId: "role-manager",
        organizationalUnitId: "ou-monitoring",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T08:40:00Z")
      },
      {
        id: "user-planner-1",
        ...loginFields("user-planner-1"),
        email: "planner1@mofa.ye",
        fullNameAr: "مريم محمد القدسي",
        titleAr: "محلل تخطيط أول",
        roleId: "role-planner",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T10:15:00Z")
      },
      {
        id: "user-planner-2",
        ...loginFields("user-planner-2"),
        email: "planner2@mofa.ye",
        fullNameAr: "علي حسن العنسي",
        titleAr: "محلل تخطيط",
        roleId: "role-planner",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-17T11:00:00Z")
      },
      {
        id: "user-monitor-1",
        ...loginFields("user-monitor-1"),
        email: "monitor1@mofa.ye",
        fullNameAr: "فاطمة صالح الشرجبي",
        titleAr: "مسؤول متابعة وتقييم",
        roleId: "role-monitor",
        organizationalUnitId: "ou-monitoring",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T09:45:00Z")
      },
      {
        id: "user-training-1",
        ...loginFields("user-training-1"),
        email: "training1@mofa.ye",
        fullNameAr: "أحمد عبدالوهاب المقالح",
        titleAr: "مسؤول التدريب والتأهيل",
        roleId: "role-training",
        organizationalUnitId: "ou-training",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-18T06:50:00Z")
      },
      {
        id: "user-riyadh-1",
        ...loginFields("user-riyadh-1"),
        email: "riyadh1@mofa.ye",
        fullNameAr: "ليلى عبدالملك القباطي",
        titleAr: "منسق تقارير البعثة - الرياض",
        roleId: "role-mission",
        organizationalUnitId: "ou-riyadh",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-17T13:20:00Z")
      },
      {
        id: "user-riyadh-2",
        ...loginFields("user-riyadh-2"),
        email: "riyadh2@mofa.ye",
        fullNameAr: "ياسر محمد الجرادي",
        titleAr: "مسؤول تعاون وبحوث - الرياض",
        roleId: "role-mission",
        organizationalUnitId: "ou-riyadh",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-17T09:10:00Z")
      },
      {
        id: "user-cairo-1",
        ...loginFields("user-cairo-1"),
        email: "cairo1@mofa.ye",
        fullNameAr: "نجلاء محمود الأهدل",
        titleAr: "منسق تقارير البعثة - القاهرة",
        roleId: "role-mission",
        organizationalUnitId: "ou-cairo",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-17T12:40:00Z")
      },
      {
        id: "user-reader",
        ...loginFields("user-reader"),
        email: "reader@mofa.ye",
        fullNameAr: "عبدالرحمن ثابت المعافا",
        titleAr: "مستشار اطلاع",
        roleId: "role-reader",
        organizationalUnitId: "ou-planning",
        status: "ACTIVE",
        lastLoginAt: d("2026-04-15T08:00:00Z")
      }
    ]
  });

  await prisma.template.createMany({
    data: [
      {
        id: "tmpl-strategy",
        code: "TPL-STRATEGY-01",
        nameAr: "قالب الأولويات والأهداف الاستراتيجية",
        description:
          "يدعم بناء الخطط وفق تسلسل: أولوية > هدف استراتيجي > هدف فرعي > مبادرة > مؤشر.",
        moduleScope: "التخطيط المؤسسي",
        status: "ACTIVE",
        version: 2,
        createdById: "user-planner-1"
      },
      {
        id: "tmpl-programs",
        code: "TPL-PROGRAM-01",
        nameAr: "قالب المحاور والبرامج والمشاريع",
        description:
          "يدعم بناء الخطط وفق تسلسل: محور > برنامج > مشروع > نشاط > مخرج > مؤشر.",
        moduleScope: "البرامج والمشاريع",
        status: "ACTIVE",
        version: 1,
        createdById: "user-planner-2"
      },
      {
        id: "tmpl-results",
        code: "TPL-RESULT-01",
        nameAr: "قالب النتائج والإجراءات",
        description: "يدعم بناء الخطط وفق تسلسل: هدف > نتيجة > إجراء > مقياس.",
        moduleScope: "المتابعة والنتائج",
        status: "DRAFT",
        version: 1,
        createdById: "user-plan-manager"
      }
    ]
  });

  await prisma.templateLevel.createMany({
    data: [
      { id: "lvl-strategy-priority", templateId: "tmpl-strategy", key: "priority", nameAr: "أولوية", levelOrder: 1, isRequired: true, iconName: "Flag" },
      { id: "lvl-strategy-goal", templateId: "tmpl-strategy", key: "strategic_goal", nameAr: "هدف استراتيجي", levelOrder: 2, isRequired: true, iconName: "Target" },
      { id: "lvl-strategy-subgoal", templateId: "tmpl-strategy", key: "sub_goal", nameAr: "هدف فرعي", levelOrder: 3, isRequired: true, iconName: "GitBranch" },
      { id: "lvl-strategy-initiative", templateId: "tmpl-strategy", key: "initiative", nameAr: "مبادرة", levelOrder: 4, isRequired: true, iconName: "Rocket" },
      { id: "lvl-strategy-kpi", templateId: "tmpl-strategy", key: "kpi", nameAr: "مؤشر", levelOrder: 5, isRequired: false, iconName: "Gauge" },
      { id: "lvl-program-axis", templateId: "tmpl-programs", key: "axis", nameAr: "محور", levelOrder: 1, isRequired: true, iconName: "Compass" },
      { id: "lvl-program-program", templateId: "tmpl-programs", key: "program", nameAr: "برنامج", levelOrder: 2, isRequired: true, iconName: "Layers3" },
      { id: "lvl-program-project", templateId: "tmpl-programs", key: "project", nameAr: "مشروع", levelOrder: 3, isRequired: true, iconName: "FolderKanban" },
      { id: "lvl-program-activity", templateId: "tmpl-programs", key: "activity", nameAr: "نشاط", levelOrder: 4, isRequired: true, iconName: "CalendarRange" },
      { id: "lvl-program-output", templateId: "tmpl-programs", key: "output", nameAr: "مخرج", levelOrder: 5, isRequired: true, iconName: "PackageOpen" },
      { id: "lvl-program-indicator", templateId: "tmpl-programs", key: "indicator", nameAr: "مؤشر", levelOrder: 6, isRequired: false, iconName: "Gauge" },
      { id: "lvl-result-objective", templateId: "tmpl-results", key: "objective", nameAr: "هدف", levelOrder: 1, isRequired: true, iconName: "Crosshair" },
      { id: "lvl-result-result", templateId: "tmpl-results", key: "result", nameAr: "نتيجة", levelOrder: 2, isRequired: true, iconName: "Sparkles" },
      { id: "lvl-result-action", templateId: "tmpl-results", key: "action", nameAr: "إجراء", levelOrder: 3, isRequired: true, iconName: "ListChecks" },
      { id: "lvl-result-measure", templateId: "tmpl-results", key: "measure", nameAr: "مقياس", levelOrder: 4, isRequired: false, iconName: "Ruler" }
    ]
  });

  await prisma.templateField.createMany({
    data: [
      { id: "field-priority-owner", templateId: "tmpl-strategy", levelId: "lvl-strategy-priority", key: "priority_owner", labelAr: "الجهة القائدة", fieldType: "USER", isRequired: true, isSystem: true, fieldOrder: 1 },
      { id: "field-goal-impact", templateId: "tmpl-strategy", levelId: "lvl-strategy-goal", key: "expected_impact", labelAr: "الأثر المتوقع", fieldType: "LONG_TEXT", isRequired: true, fieldOrder: 1 },
      { id: "field-subgoal-status", templateId: "tmpl-strategy", levelId: "lvl-strategy-subgoal", key: "delivery_status", labelAr: "حالة التنفيذ", fieldType: "STATUS", isRequired: true, fieldOrder: 1 },
      { id: "field-initiative-budget", templateId: "tmpl-strategy", levelId: "lvl-strategy-initiative", key: "estimated_budget", labelAr: "الميزانية التقديرية", fieldType: "NUMBER", isRequired: false, fieldOrder: 1 },
      { id: "field-kpi-target", templateId: "tmpl-strategy", levelId: "lvl-strategy-kpi", key: "target_value", labelAr: "القيمة المستهدفة", fieldType: "NUMBER", isRequired: true, isSystem: true, fieldOrder: 1 },
      { id: "field-axis-rationale", templateId: "tmpl-programs", levelId: "lvl-program-axis", key: "policy_rationale", labelAr: "المبرر السياساتي", fieldType: "LONG_TEXT", isRequired: true, fieldOrder: 1 },
      { id: "field-program-sponsor", templateId: "tmpl-programs", levelId: "lvl-program-program", key: "program_sponsor", labelAr: "الراعي التنفيذي", fieldType: "USER", isRequired: false, fieldOrder: 1 },
      { id: "field-project-risk", templateId: "tmpl-programs", levelId: "lvl-program-project", key: "risk_level", labelAr: "مستوى المخاطر", fieldType: "SELECT", options: ["منخفض", "متوسط", "مرتفع"], isRequired: true, fieldOrder: 1 },
      { id: "field-activity-start", templateId: "tmpl-programs", levelId: "lvl-program-activity", key: "planned_start", labelAr: "تاريخ البدء", fieldType: "DATE", isRequired: true, fieldOrder: 1 },
      { id: "field-output-beneficiaries", templateId: "tmpl-programs", levelId: "lvl-program-output", key: "beneficiaries", labelAr: "الفئة المستفيدة", fieldType: "TEXT", isRequired: false, fieldOrder: 1 },
      { id: "field-indicator-baseline", templateId: "tmpl-programs", levelId: "lvl-program-indicator", key: "baseline_value", labelAr: "خط الأساس", fieldType: "NUMBER", isRequired: true, fieldOrder: 1 },
      { id: "field-objective-owner", templateId: "tmpl-results", levelId: "lvl-result-objective", key: "objective_owner", labelAr: "المالك الإداري", fieldType: "USER", isRequired: true, fieldOrder: 1 },
      { id: "field-result-verification", templateId: "tmpl-results", levelId: "lvl-result-result", key: "means_of_verification", labelAr: "وسيلة التحقق", fieldType: "TEXT", isRequired: true, fieldOrder: 1 },
      { id: "field-action-dependency", templateId: "tmpl-results", levelId: "lvl-result-action", key: "dependency_note", labelAr: "الاعتماديات", fieldType: "LONG_TEXT", isRequired: false, fieldOrder: 1 },
      { id: "field-measure-frequency", templateId: "tmpl-results", levelId: "lvl-result-measure", key: "measurement_frequency", labelAr: "وتيرة القياس", fieldType: "SELECT", options: ["شهري", "ربع سنوي", "نصف سنوي"], isRequired: true, fieldOrder: 1 }
    ]
  });

  await prisma.kPI.createMany({
    data: [
      { id: "kpi-01", code: "KPI-PLAN-01", titleAr: "نسبة اعتماد الخطط في الوقت المحدد", unitAr: "%", source: "سجل الاعتمادات", ownerId: "user-plan-manager", baselineValue: 68, targetValue: 90, actualValue: 84, warningThreshold: 80, criticalThreshold: 70, status: "WATCH", frequencyLabel: "ربع سنوي" },
      { id: "kpi-02", code: "KPI-PLAN-02", titleAr: "نسبة اكتمال حقول الخطط", unitAr: "%", source: "منصة التخطيط", ownerId: "user-planner-1", baselineValue: 55, targetValue: 95, actualValue: 92, warningThreshold: 85, criticalThreshold: 75, status: "HEALTHY", frequencyLabel: "شهري" },
      { id: "kpi-03", code: "KPI-ME-01", titleAr: "نسبة العناصر المتأخرة في المتابعة", unitAr: "%", source: "دورات المتابعة", ownerId: "user-monitor-1", baselineValue: 32, targetValue: 10, actualValue: 18, warningThreshold: 15, criticalThreshold: 25, status: "WATCH", frequencyLabel: "ربع سنوي" },
      { id: "kpi-04", code: "KPI-ME-02", titleAr: "معدل إغلاق الإجراءات التصحيحية", unitAr: "%", source: "سجل المعالجات", ownerId: "user-monitor-manager", baselineValue: 41, targetValue: 85, actualValue: 76, warningThreshold: 70, criticalThreshold: 55, status: "WATCH", frequencyLabel: "ربع سنوي" },
      { id: "kpi-05", code: "KPI-REP-01", titleAr: "نسبة التقارير المرفوعة في موعدها", unitAr: "%", source: "تقارير البعثات", ownerId: "user-riyadh-1", baselineValue: 62, targetValue: 95, actualValue: 88, warningThreshold: 85, criticalThreshold: 70, status: "HEALTHY", frequencyLabel: "نصف سنوي" },
      { id: "kpi-06", code: "KPI-REP-02", titleAr: "متوسط زمن مراجعة التقارير", unitAr: "يوم", source: "سجل المراجعات", ownerId: "user-plan-manager", baselineValue: 11, targetValue: 5, actualValue: 6, warningThreshold: 7, criticalThreshold: 10, status: "WATCH", frequencyLabel: "نصف سنوي" },
      { id: "kpi-07", code: "KPI-TRN-01", titleAr: "نسبة إشغال المقاعد التدريبية", unitAr: "%", source: "برامج التدريب", ownerId: "user-training-1", baselineValue: 48, targetValue: 85, actualValue: 81, warningThreshold: 75, criticalThreshold: 60, status: "WATCH", frequencyLabel: "ربع سنوي" },
      { id: "kpi-08", code: "KPI-TRN-02", titleAr: "نسبة إكمال تقارير ما بعد التدريب", unitAr: "%", source: "سجل التدريب", ownerId: "user-training-1", baselineValue: 30, targetValue: 90, actualValue: 67, warningThreshold: 75, criticalThreshold: 55, status: "CRITICAL", frequencyLabel: "ربع سنوي" },
      { id: "kpi-09", code: "KPI-KNW-01", titleAr: "عدد الوثائق المعرفية المؤرشفة", unitAr: "وثيقة", source: "مكتبة المعرفة", ownerId: "user-planner-2", baselineValue: 25, targetValue: 120, actualValue: 73, warningThreshold: 60, criticalThreshold: 40, status: "HEALTHY", frequencyLabel: "شهري" },
      { id: "kpi-10", code: "KPI-KNW-02", titleAr: "نسبة الوثائق المرتبطة بخطط أو تقارير", unitAr: "%", source: "مكتبة المعرفة", ownerId: "user-planner-2", baselineValue: 18, targetValue: 80, actualValue: 58, warningThreshold: 60, criticalThreshold: 45, status: "WATCH", frequencyLabel: "شهري" },
      { id: "kpi-11", code: "KPI-WF-01", titleAr: "معدل حسم طلبات الاعتماد خلال 72 ساعة", unitAr: "%", source: "سير العمل", ownerId: "user-admin", baselineValue: 52, targetValue: 90, actualValue: 79, warningThreshold: 80, criticalThreshold: 65, status: "WATCH", frequencyLabel: "أسبوعي" },
      { id: "kpi-12", code: "KPI-DASH-01", titleAr: "نسبة المبادرات ذات التقدم الصحي", unitAr: "%", source: "لوحة القيادة", ownerId: "user-dg", baselineValue: 44, targetValue: 85, actualValue: 71, warningThreshold: 75, criticalThreshold: 55, status: "WATCH", frequencyLabel: "شهري" }
    ]
  });

  await prisma.plan.createMany({
    data: [
      {
        id: "plan-01",
        code: "PLAN-2026-STRAT",
        titleAr: "الخطة المؤسسية للإدارة العامة للتخطيط والبحوث 2026-2028",
        description: "خطة مؤسسية ترتكز على التخطيط الديناميكي، المتابعة، والتكامل مع البعثات.",
        periodLabel: "2026 - 2028",
        status: "UNDER_REVIEW",
        templateId: "tmpl-strategy",
        organizationalUnitId: "ou-planning",
        ownerId: "user-plan-manager",
        createdById: "user-planner-1",
        startDate: d("2026-01-01T00:00:00Z"),
        endDate: d("2028-12-31T00:00:00Z"),
        submittedAt: d("2026-03-15T08:00:00Z"),
        templateSnapshot: { levels: ["أولوية", "هدف استراتيجي", "هدف فرعي", "مبادرة", "مؤشر"] }
      },
      {
        id: "plan-02",
        code: "PLAN-2026-MISSION",
        titleAr: "خطة تطوير التقارير الدبلوماسية والبعثات 2026",
        description: "خطة تشغيلية تركّز على توحيد التقارير، بناء القدرات، ورفع سرعة الاعتماد.",
        periodLabel: "2026",
        status: "APPROVED",
        templateId: "tmpl-programs",
        organizationalUnitId: "ou-planning",
        ownerId: "user-plan-manager",
        createdById: "user-planner-2",
        startDate: d("2026-01-01T00:00:00Z"),
        endDate: d("2026-12-31T00:00:00Z"),
        submittedAt: d("2026-01-20T08:00:00Z"),
        approvedAt: d("2026-01-28T09:30:00Z"),
        templateSnapshot: { levels: ["محور", "برنامج", "مشروع", "نشاط", "مخرج", "مؤشر"] }
      }
    ]
  });

  await prisma.planNode.createMany({
    data: [
      { id: "node-01", planId: "plan-01", templateLevelId: "lvl-strategy-priority", titleAr: "الأولوية الأولى: ترسيخ التخطيط المؤسسي المبني على الأدلة", status: "ACTIVE", sortOrder: 1, ownerId: "user-plan-manager", startDate: d("2026-01-01T00:00:00Z"), endDate: d("2026-12-31T00:00:00Z"), progressPercent: 72 },
      { id: "node-02", planId: "plan-01", parentId: "node-01", templateLevelId: "lvl-strategy-goal", titleAr: "رفع جودة الخطط القطاعية والوحدوية", status: "ACTIVE", sortOrder: 1, ownerId: "user-planner-1", progressPercent: 78 },
      { id: "node-03", planId: "plan-01", parentId: "node-02", templateLevelId: "lvl-strategy-subgoal", titleAr: "توحيد منهجية إعداد الخطط وحقول الإدخال", status: "ACTIVE", sortOrder: 1, ownerId: "user-planner-1", progressPercent: 85, customFieldValues: { delivery_status: "ضمن المسار", expected_completion: "الربع الثاني 2026" } },
      { id: "node-04", planId: "plan-01", parentId: "node-03", templateLevelId: "lvl-strategy-initiative", titleAr: "إطلاق دليل التخطيط المؤسسي الموحد", status: "ACTIVE", sortOrder: 1, ownerId: "user-planner-2", startDate: d("2026-01-10T00:00:00Z"), endDate: d("2026-06-30T00:00:00Z"), progressPercent: 90 },
      { id: "node-05", planId: "plan-01", parentId: "node-03", templateLevelId: "lvl-strategy-initiative", titleAr: "بناء سجل مؤشرات موحد وربطه بالقوالب", status: "AT_RISK", sortOrder: 2, ownerId: "user-planner-1", startDate: d("2026-02-01T00:00:00Z"), endDate: d("2026-08-31T00:00:00Z"), progressPercent: 64 },
      { id: "node-06", planId: "plan-01", parentId: "node-01", templateLevelId: "lvl-strategy-goal", titleAr: "تطوير منظومة المتابعة والتقييم وربطها بسير العمل", status: "ACTIVE", sortOrder: 2, ownerId: "user-monitor-manager", progressPercent: 69 },
      { id: "node-07", planId: "plan-01", parentId: "node-06", templateLevelId: "lvl-strategy-subgoal", titleAr: "أتمتة دورات المتابعة الفصلية والإجراءات التصحيحية", status: "ACTIVE", sortOrder: 1, ownerId: "user-monitor-1", progressPercent: 63 },
      { id: "node-08", planId: "plan-01", parentId: "node-07", templateLevelId: "lvl-strategy-initiative", titleAr: "اعتماد دورة متابعة ربع سنوية موحدة", status: "ACTIVE", sortOrder: 1, ownerId: "user-monitor-1", startDate: d("2026-01-15T00:00:00Z"), endDate: d("2026-12-15T00:00:00Z"), progressPercent: 71 },
      { id: "node-09", planId: "plan-01", templateLevelId: "lvl-strategy-priority", titleAr: "الأولوية الثانية: تحسين تقارير البعثات والدعم التنفيذي", status: "ACTIVE", sortOrder: 2, ownerId: "user-plan-manager", progressPercent: 66 },
      { id: "node-10", planId: "plan-01", parentId: "node-09", templateLevelId: "lvl-strategy-goal", titleAr: "رفع جودة التقارير الدورية للبعثات", status: "ACTIVE", sortOrder: 1, ownerId: "user-plan-manager", progressPercent: 67 },
      { id: "node-11", planId: "plan-01", parentId: "node-10", templateLevelId: "lvl-strategy-subgoal", titleAr: "توحيد نماذج تقارير البعثات ومسارات المراجعة", status: "ACTIVE", sortOrder: 1, ownerId: "user-riyadh-1", progressPercent: 61 },
      { id: "node-12", planId: "plan-01", parentId: "node-11", templateLevelId: "lvl-strategy-initiative", titleAr: "إطلاق نموذج نصف سنوي موحد مع تعليقات مراجعة", status: "AT_RISK", sortOrder: 1, ownerId: "user-riyadh-1", startDate: d("2026-02-15T00:00:00Z"), endDate: d("2026-07-15T00:00:00Z"), progressPercent: 52 },
      { id: "node-13", planId: "plan-02", templateLevelId: "lvl-program-axis", titleAr: "محور الدبلوماسية الفاعلة القائمة على البيانات", status: "ACTIVE", sortOrder: 1, ownerId: "user-plan-manager", progressPercent: 80 },
      { id: "node-14", planId: "plan-02", parentId: "node-13", templateLevelId: "lvl-program-program", titleAr: "برنامج تطوير التقارير والتحليل الدبلوماسي", status: "ACTIVE", sortOrder: 1, ownerId: "user-planner-2", progressPercent: 82 },
      { id: "node-15", planId: "plan-02", parentId: "node-14", templateLevelId: "lvl-program-project", titleAr: "مشروع رفع جاهزية منسقي التقارير في البعثات", status: "ACTIVE", sortOrder: 1, ownerId: "user-training-1", progressPercent: 77 },
      { id: "node-16", planId: "plan-02", parentId: "node-15", templateLevelId: "lvl-program-activity", titleAr: "تنفيذ ورش تدريبية على النماذج الموحدة", status: "ACTIVE", sortOrder: 1, ownerId: "user-training-1", progressPercent: 74 },
      { id: "node-17", planId: "plan-02", parentId: "node-16", templateLevelId: "lvl-program-output", titleAr: "إصدار حقائب تدريب وتقارير مرجعية", status: "ACTIVE", sortOrder: 1, ownerId: "user-training-1", progressPercent: 83 },
      { id: "node-18", planId: "plan-02", parentId: "node-17", templateLevelId: "lvl-program-indicator", titleAr: "مؤشر نسبة الجاهزية الفنية للبعثات", status: "ACTIVE", sortOrder: 1, ownerId: "user-training-1", progressPercent: 81 },
      { id: "node-19", planId: "plan-02", parentId: "node-13", templateLevelId: "lvl-program-program", titleAr: "برنامج تسريع الاعتماد ومتابعة الملاحظات", status: "ACTIVE", sortOrder: 2, ownerId: "user-monitor-manager", progressPercent: 75 },
      { id: "node-20", planId: "plan-02", parentId: "node-19", templateLevelId: "lvl-program-project", titleAr: "مشروع رقمنة مسار مراجعة التقارير", status: "ACTIVE", sortOrder: 1, ownerId: "user-admin", progressPercent: 73 },
      { id: "node-21", planId: "plan-02", parentId: "node-20", templateLevelId: "lvl-program-activity", titleAr: "تفعيل التعليقات المرحلية وإشعارات الإرجاع", status: "ACTIVE", sortOrder: 1, ownerId: "user-admin", progressPercent: 69 },
      { id: "node-22", planId: "plan-02", parentId: "node-21", templateLevelId: "lvl-program-output", titleAr: "لوحة اعتماد موحدة وتقارير زمن الاستجابة", status: "ACTIVE", sortOrder: 1, ownerId: "user-admin", progressPercent: 76 },
      { id: "node-23", planId: "plan-02", parentId: "node-22", templateLevelId: "lvl-program-indicator", titleAr: "مؤشر حسم الاعتمادات خلال 72 ساعة", status: "ACTIVE", sortOrder: 1, ownerId: "user-admin", progressPercent: 79 }
    ]
  });

  await prisma.planNodeKPI.createMany({
    data: [
      { id: "link-01", planNodeId: "node-04", kpiId: "kpi-01", weight: 30 },
      { id: "link-02", planNodeId: "node-05", kpiId: "kpi-02", weight: 40 },
      { id: "link-03", planNodeId: "node-08", kpiId: "kpi-03", weight: 50 },
      { id: "link-04", planNodeId: "node-08", kpiId: "kpi-04", weight: 50 },
      { id: "link-05", planNodeId: "node-12", kpiId: "kpi-05", weight: 60 },
      { id: "link-06", planNodeId: "node-12", kpiId: "kpi-06", weight: 40 },
      { id: "link-07", planNodeId: "node-17", kpiId: "kpi-07", weight: 45 },
      { id: "link-08", planNodeId: "node-17", kpiId: "kpi-08", weight: 55 },
      { id: "link-09", planNodeId: "node-18", kpiId: "kpi-12", weight: 100 },
      { id: "link-10", planNodeId: "node-22", kpiId: "kpi-11", weight: 100 },
      { id: "link-11", planNodeId: "node-23", kpiId: "kpi-11", weight: 100 },
      { id: "link-12", planNodeId: "node-05", kpiId: "kpi-09", weight: 25 }
    ]
  });

  await prisma.initiative.createMany({
    data: [
      { id: "init-01", code: "INIT-01", titleAr: "إعداد دليل التخطيط المؤسسي", description: "صياغة دليل موحد وإطلاقه مع قوالب إلكترونية معتمدة.", status: "ACTIVE", planId: "plan-01", planNodeId: "node-04", ownerId: "user-planner-2", startDate: d("2026-01-10T00:00:00Z"), endDate: d("2026-06-30T00:00:00Z"), progressPercent: 90, correctiveAction: "اعتماد النسخة النهائية بعد دمج ملاحظات الإدارات." },
      { id: "init-02", code: "INIT-02", titleAr: "تطوير سجل المؤشرات وربطه بالقوالب", description: "بناء سجل KPI مركزي مع حقول baseline وtarget وowner.", status: "AT_RISK", planId: "plan-01", planNodeId: "node-05", ownerId: "user-planner-1", startDate: d("2026-02-01T00:00:00Z"), endDate: d("2026-08-31T00:00:00Z"), progressPercent: 64, blockerSummary: "تأخر توحيد مصادر البيانات لبعض الإدارات.", correctiveAction: "عقد ورشة اعتماد مصادر المؤشرات مع الجهات المالكة." },
      { id: "init-03", code: "INIT-03", titleAr: "تشغيل دورة متابعة ربع سنوية", description: "إطلاق دورة متابعة تتضمن تحديثات التقدم والعوائق والإجراءات.", status: "ACTIVE", planId: "plan-01", planNodeId: "node-08", ownerId: "user-monitor-1", startDate: d("2026-01-15T00:00:00Z"), endDate: d("2026-12-15T00:00:00Z"), progressPercent: 71 },
      { id: "init-04", code: "INIT-04", titleAr: "مراجعة نماذج التقارير الدبلوماسية", description: "مراجعة النماذج نصف السنوية وربطها بمسار تعليقات واضح.", status: "AT_RISK", planId: "plan-01", planNodeId: "node-12", ownerId: "user-riyadh-1", startDate: d("2026-02-15T00:00:00Z"), endDate: d("2026-07-15T00:00:00Z"), progressPercent: 52, blockerSummary: "عدم اتساق حقول بعض البعثات مع المتطلبات المركزية." },
      { id: "init-05", code: "INIT-05", titleAr: "تدريب منسقي البعثات على النماذج الموحدة", description: "تنفيذ برنامج تدريبي لرفع الجاهزية الفنية للبعثات.", status: "ACTIVE", planId: "plan-02", planNodeId: "node-16", ownerId: "user-training-1", startDate: d("2026-02-05T00:00:00Z"), endDate: d("2026-09-01T00:00:00Z"), progressPercent: 74 },
      { id: "init-06", code: "INIT-06", titleAr: "رقمنة سير الاعتماد", description: "بناء مسار اعتماد إلكتروني مع تنبيهات زمن الاستجابة.", status: "ACTIVE", planId: "plan-02", planNodeId: "node-21", ownerId: "user-admin", startDate: d("2026-01-12T00:00:00Z"), endDate: d("2026-06-15T00:00:00Z"), progressPercent: 69 },
      { id: "init-07", code: "INIT-07", titleAr: "إنشاء مكتبة بحوث مركزية", description: "فهرسة البحوث وربطها بالخطط والبرامج والتقارير.", status: "ACTIVE", planId: "plan-01", planNodeId: "node-05", ownerId: "user-planner-2", startDate: d("2026-03-01T00:00:00Z"), endDate: d("2026-12-31T00:00:00Z"), progressPercent: 58 },
      { id: "init-08", code: "INIT-08", titleAr: "برنامج سفراء الأداء المؤسسي", description: "إعداد شبكة نقاط اتصال في الإدارات والبعثات لدعم التنفيذ.", status: "ACTIVE", planId: "plan-02", planNodeId: "node-17", ownerId: "user-training-1", startDate: d("2026-03-10T00:00:00Z"), endDate: d("2026-11-20T00:00:00Z"), progressPercent: 61, dependencies: ["اعتماد قائمة المرشحين", "استكمال الحقيبة التدريبية"] }
    ]
  });

  await prisma.monitoringCycle.createMany({
    data: [
      {
        id: "cycle-01",
        titleAr: "دورة المتابعة للربع الأول 2026",
        periodLabel: "الربع الأول 2026",
        status: "OPEN",
        planId: "plan-01",
        ownerUnitId: "ou-monitoring",
        createdById: "user-monitor-1",
        startDate: d("2026-03-25T00:00:00Z"),
        endDate: d("2026-04-15T00:00:00Z"),
        summary: "تغطية المبادرات ذات الأولوية العالية ومراجعة التعثرات."
      },
      {
        id: "cycle-02",
        titleAr: "دورة المتابعة النصف سنوية 2026",
        periodLabel: "النصف الأول 2026",
        status: "IN_REVIEW",
        planId: "plan-02",
        ownerUnitId: "ou-monitoring",
        createdById: "user-monitor-manager",
        startDate: d("2026-06-10T00:00:00Z"),
        endDate: d("2026-07-05T00:00:00Z"),
        summary: "تقييم أثر التدريب وسرعة الاعتماد وجودة التقارير."
      }
    ]
  });

  await prisma.monitoringUpdate.createMany({
    data: [
      {
        id: "mu-01",
        cycleId: "cycle-01",
        planNodeId: "node-05",
        initiativeId: "init-02",
        kpiId: "kpi-02",
        reportedProgress: 64,
        obstacleText: "تفاوت جاهزية الإدارات لإدخال البيانات الأساسية للمؤشرات.",
        correctiveActionText: "تكليف سفراء الأداء بتجهيز الحقول الحرجة قبل نهاية أبريل.",
        status: "SUBMITTED",
        submittedById: "user-monitor-1"
      },
      {
        id: "mu-02",
        cycleId: "cycle-01",
        planNodeId: "node-08",
        initiativeId: "init-03",
        kpiId: "kpi-03",
        reportedProgress: 71,
        correctiveActionText: "متابعة أسبوعية للعناصر المتأخرة مع مديري الإدارات.",
        status: "REVIEWED",
        submittedById: "user-monitor-1"
      },
      {
        id: "mu-03",
        cycleId: "cycle-01",
        planNodeId: "node-12",
        initiativeId: "init-04",
        kpiId: "kpi-05",
        reportedProgress: 52,
        obstacleText: "حاجة البعثات إلى توضيح أوفى بشأن الحقول التحليلية.",
        correctiveActionText: "تحديث دليل المستخدم وعقد جلسة إيضاح للبعثات.",
        reviewComment: "إرفاق نموذج مقارنة بين النسخة الحالية والمقترحة.",
        status: "RETURNED",
        submittedById: "user-monitor-manager"
      },
      {
        id: "mu-04",
        cycleId: "cycle-02",
        planNodeId: "node-17",
        initiativeId: "init-08",
        kpiId: "kpi-07",
        reportedProgress: 61,
        correctiveActionText: "استكمال اعتماد المرشحين من الإدارات قبل نهاية يونيو.",
        status: "SUBMITTED",
        submittedById: "user-training-1"
      },
      {
        id: "mu-05",
        cycleId: "cycle-02",
        planNodeId: "node-21",
        initiativeId: "init-06",
        kpiId: "kpi-11",
        reportedProgress: 69,
        correctiveActionText: "تجربة مسار الاعتماد مع 3 بعثات قبل التعميم الشامل.",
        status: "REVIEWED",
        submittedById: "user-admin"
      }
    ]
  });

  await prisma.missionReport.createMany({
    data: [
      {
        id: "report-01",
        code: "REP-RUH-H1-2026",
        titleAr: "التقرير النصف سنوي - بعثة الرياض",
        reportingPeriod: "النصف الأول 2026",
        missionNameAr: "بعثة اليمن - الرياض",
        countryAr: "المملكة العربية السعودية",
        status: "UNDER_REVIEW",
        organizationalUnitId: "ou-riyadh",
        submittedById: "user-riyadh-1",
        reviewerId: "user-plan-manager",
        completionPercent: 100,
        executiveSummary: "يغطي التقرير الأنشطة السياسية والقنصلية والتنسيقية خلال النصف الأول.",
        achievements: "رفع انتظام التقارير الأسبوعية وتحسين التنسيق القنصلي.",
        challenges: "الحاجة لتوحيد منهجية صياغة التحليل النوعي.",
        supportRequests: "توفير مرجع موحد للبيانات الاقتصادية والدبلوماسية.",
        submittedAt: d("2026-04-10T09:00:00Z"),
        statusHistory: [
          { status: "DRAFT", date: "2026-04-02" },
          { status: "SUBMITTED", date: "2026-04-10" },
          { status: "UNDER_REVIEW", date: "2026-04-11" }
        ]
      },
      {
        id: "report-02",
        code: "REP-RUH-H2-2025",
        titleAr: "التقرير النصف سنوي - بعثة الرياض (مرجعي)",
        reportingPeriod: "النصف الثاني 2025",
        missionNameAr: "بعثة اليمن - الرياض",
        countryAr: "المملكة العربية السعودية",
        status: "APPROVED",
        organizationalUnitId: "ou-riyadh",
        submittedById: "user-riyadh-2",
        reviewerId: "user-plan-manager",
        completionPercent: 100,
        executiveSummary: "تقرير مرجعي تمت الاستفادة منه في تحسين النموذج الجديد.",
        achievements: "تحسين دقة التحليل الأسبوعي والتقارير القطاعية.",
        submittedAt: d("2025-12-20T09:00:00Z"),
        approvedAt: d("2025-12-28T11:00:00Z"),
        statusHistory: [
          { status: "SUBMITTED", date: "2025-12-20" },
          { status: "APPROVED", date: "2025-12-28" }
        ]
      },
      {
        id: "report-03",
        code: "REP-CAI-H1-2026",
        titleAr: "التقرير النصف سنوي - بعثة القاهرة",
        reportingPeriod: "النصف الأول 2026",
        missionNameAr: "بعثة اليمن - القاهرة",
        countryAr: "جمهورية مصر العربية",
        status: "RETURNED",
        organizationalUnitId: "ou-cairo",
        submittedById: "user-cairo-1",
        reviewerId: "user-plan-manager",
        completionPercent: 82,
        executiveSummary: "يتضمن التقرير المحاور التعليمية والثقافية والخدمات القنصلية.",
        challenges: "بعض المؤشرات النوعية تحتاج إسنادًا بأدلة مرفقة.",
        supportRequests: "توفير نموذج موحد للأثر النوعي للأنشطة الثقافية.",
        submittedAt: d("2026-04-09T08:00:00Z"),
        returnedAt: d("2026-04-12T10:30:00Z"),
        statusHistory: [
          { status: "DRAFT", date: "2026-04-01" },
          { status: "SUBMITTED", date: "2026-04-09" },
          { status: "RETURNED", date: "2026-04-12" }
        ]
      },
      {
        id: "report-04",
        code: "REP-CAI-H2-2025",
        titleAr: "التقرير النصف سنوي - بعثة القاهرة (مرجعي)",
        reportingPeriod: "النصف الثاني 2025",
        missionNameAr: "بعثة اليمن - القاهرة",
        countryAr: "جمهورية مصر العربية",
        status: "APPROVED",
        organizationalUnitId: "ou-cairo",
        submittedById: "user-cairo-1",
        reviewerId: "user-plan-manager",
        completionPercent: 100,
        achievements: "توثيق مبادرات التعاون الأكاديمي والثقافي.",
        submittedAt: d("2025-12-18T08:30:00Z"),
        approvedAt: d("2025-12-27T13:15:00Z")
      },
      {
        id: "report-05",
        code: "REP-RUH-Q1-2026",
        titleAr: "تقرير ربع سنوي - بعثة الرياض",
        reportingPeriod: "الربع الأول 2026",
        missionNameAr: "بعثة اليمن - الرياض",
        countryAr: "المملكة العربية السعودية",
        status: "DRAFT",
        organizationalUnitId: "ou-riyadh",
        submittedById: "user-riyadh-1",
        reviewerId: "user-plan-manager",
        completionPercent: 64,
        executiveSummary: "مسودة أولية قيد الاستكمال."
      },
      {
        id: "report-06",
        code: "REP-CAI-Q1-2026",
        titleAr: "تقرير ربع سنوي - بعثة القاهرة",
        reportingPeriod: "الربع الأول 2026",
        missionNameAr: "بعثة اليمن - القاهرة",
        countryAr: "جمهورية مصر العربية",
        status: "SUBMITTED",
        organizationalUnitId: "ou-cairo",
        submittedById: "user-cairo-1",
        reviewerId: "user-plan-manager",
        completionPercent: 96,
        executiveSummary: "يركز على المستجدات التعليمية والتنسيق الثقافي.",
        submittedAt: d("2026-04-14T07:30:00Z")
      }
    ]
  });

  await prisma.missionReportComment.createMany({
    data: [
      { id: "comment-01", reportId: "report-03", authorId: "user-plan-manager", type: "RETURN", comment: "يرجى تدعيم فقرة الأثر النوعي ببيانات أو أمثلة توضح أثر الأنشطة الثقافية." },
      { id: "comment-02", reportId: "report-01", authorId: "user-plan-manager", type: "REVIEW", comment: "التقرير مكتمل، مع ملاحظة بسيطة على توحيد صياغة قسم التحديات." },
      { id: "comment-03", reportId: "report-06", authorId: "user-reader", type: "GENERAL", comment: "تقرير منظم ويحتاج فقط تدقيقًا لغويًا قبل الاعتماد." }
    ]
  });

  await prisma.trainingProgram.createMany({
    data: [
      { id: "training-01", code: "TRN-2026-01", titleAr: "برنامج بناء مؤشرات الأداء المؤسسي", providerAr: "معهد التدريب الدبلوماسي", locationAr: "عدن / افتراضي", status: "OPEN", targetAudience: "محللو التخطيط ومسؤولو المتابعة", description: "برنامج تطبيقي لتصميم المؤشرات وبناء خطوط الأساس والأهداف.", seats: 20, startDate: d("2026-05-10T00:00:00Z"), endDate: d("2026-05-14T00:00:00Z"), organizationalUnitId: "ou-training", createdById: "user-training-1" },
      { id: "training-02", code: "TRN-2026-02", titleAr: "ورشة التقارير الدبلوماسية والتحليل النوعي", providerAr: "قطاع البحوث والدراسات", locationAr: "الرياض / افتراضي", status: "IN_PROGRESS", targetAudience: "منسقو التقارير في البعثات", description: "تركز على تحسين المحتوى التحليلي وربط التقارير بالمؤشرات.", seats: 15, startDate: d("2026-04-20T00:00:00Z"), endDate: d("2026-04-24T00:00:00Z"), organizationalUnitId: "ou-training", createdById: "user-training-1" },
      { id: "training-03", code: "TRN-2026-03", titleAr: "برنامج إدارة المعرفة المؤسسية", providerAr: "إدارة التخطيط والبحوث", locationAr: "عدن", status: "DRAFT", targetAudience: "الباحثون ونقاط الاتصال المعرفية", description: "برنامج لإدارة الوثائق، التصنيف، والربط مع الخطط والتقارير.", seats: 18, startDate: d("2026-06-01T00:00:00Z"), endDate: d("2026-06-05T00:00:00Z"), organizationalUnitId: "ou-training", createdById: "user-training-1" },
      { id: "training-04", code: "TRN-2025-04", titleAr: "برنامج سفراء الأداء المؤسسي", providerAr: "إدارة المتابعة والتقييم", locationAr: "حضوري / افتراضي", status: "COMPLETED", targetAudience: "مديرو الإدارات ونقاط الاتصال", description: "برنامج سابق أُنجز بنجاح ويستخدم كمرجع للتوسع في 2026.", seats: 25, startDate: d("2025-11-10T00:00:00Z"), endDate: d("2025-11-17T00:00:00Z"), organizationalUnitId: "ou-training", createdById: "user-training-1" }
    ]
  });

  await prisma.trainingNomination.createMany({
    data: [
      { id: "nom-01", programId: "training-01", nomineeId: "user-planner-1", managerId: "user-plan-manager", status: "APPROVED", motivation: "مرشحة لقيادة توحيد سجل المؤشرات في الإدارة العامة.", managerComment: "الترشيح معتمد مع ضرورة إعداد ورقة تطبيقية بعد البرنامج.", decidedAt: d("2026-04-15T08:00:00Z") },
      { id: "nom-02", programId: "training-01", nomineeId: "user-monitor-1", managerId: "user-monitor-manager", status: "APPROVED", motivation: "بحاجة إلى تعميق الربط بين المتابعة ومؤشرات الأداء.", decidedAt: d("2026-04-16T08:00:00Z") },
      { id: "nom-03", programId: "training-02", nomineeId: "user-riyadh-1", managerId: "user-plan-manager", status: "PENDING_MANAGER_APPROVAL", motivation: "تطوير جودة التقارير النصف سنوية لبعثة الرياض." },
      { id: "nom-04", programId: "training-02", nomineeId: "user-cairo-1", managerId: "user-plan-manager", status: "APPROVED", motivation: "الاستفادة من الملاحظات الأخيرة على تقارير القاهرة.", decidedAt: d("2026-04-17T09:30:00Z") },
      { id: "nom-05", programId: "training-04", nomineeId: "user-admin", managerId: "user-dg", status: "APPROVED", motivation: "قيادة مسار الرقمنة والاعتماد المؤسسي.", decidedAt: d("2025-11-01T08:00:00Z") },
      { id: "nom-06", programId: "training-04", nomineeId: "user-planner-2", managerId: "user-plan-manager", status: "REJECTED", motivation: "الاعتذار بسبب ارتباطات تنفيذية في الخطة.", managerComment: "يُعاد ترشيحه في الدورة المقبلة.", decidedAt: d("2025-11-02T08:00:00Z") }
    ]
  });

  await prisma.trainingParticipation.createMany({
    data: [
      { id: "part-01", programId: "training-01", participantId: "user-planner-1", nominationId: "nom-01", status: "REGISTERED" },
      { id: "part-02", programId: "training-01", participantId: "user-monitor-1", nominationId: "nom-02", status: "REGISTERED" },
      { id: "part-03", programId: "training-02", participantId: "user-cairo-1", nominationId: "nom-04", status: "ATTENDED", postTrainingReport: "جرى تطبيق إطار جديد لصياغة الأثر النوعي في التقرير." },
      { id: "part-04", programId: "training-04", participantId: "user-admin", nominationId: "nom-05", status: "COMPLETED", certificateUrl: "/certificates/sample.pdf", postTrainingReport: "تم نقل المعرفة إلى الفريق التنفيذي وبناء دليل إجراءات أولي.", impactEvaluation: "أدى البرنامج إلى تسريع مشروع الرقمنة ورفع التنسيق بين الإدارات." }
    ]
  });

  await prisma.knowledgeDocument.createMany({
    data: [
      { id: "doc-01", code: "KNW-001", titleAr: "الدليل المرجعي للتخطيط المؤسسي 2026", documentType: "دليل", summary: "مرجع موحد لبناء القوالب وإعداد الخطط المؤسسية.", tags: ["تخطيط", "قوالب", "منهجية"], uploadedById: "user-planner-2", organizationalUnitId: "ou-planning", planId: "plan-01" },
      { id: "doc-02", code: "KNW-002", titleAr: "دراسة تحليلية حول مؤشرات الأداء في البعثات", documentType: "بحث", summary: "ورقة بحثية حول بناء مؤشرات قابلة للقياس في البيئة الدبلوماسية.", tags: ["بحوث", "مؤشرات", "بعثات"], uploadedById: "user-planner-1", organizationalUnitId: "ou-planning", planId: "plan-02" },
      { id: "doc-03", code: "KNW-003", titleAr: "قائمة تدقيق التقارير النصف سنوية", documentType: "أداة", summary: "قائمة تدقيق للمراجعين قبل اعتماد تقارير البعثات.", tags: ["تقارير", "اعتمادات", "مراجعة"], uploadedById: "user-plan-manager", organizationalUnitId: "ou-planning", missionReportId: "report-01" },
      { id: "doc-04", code: "KNW-004", titleAr: "حقيبة ورشة التقارير الدبلوماسية", documentType: "حقيبة تدريبية", summary: "مواد تدريبية لبرنامج التقارير والتحليل النوعي.", tags: ["تدريب", "تقارير", "تحليل نوعي"], uploadedById: "user-training-1", organizationalUnitId: "ou-training", trainingProgramId: "training-02" },
      { id: "doc-05", code: "KNW-005", titleAr: "إطار الإجراءات التصحيحية للمتابعة", documentType: "دليل إجرائي", summary: "يوضح تصنيف العوائق وآليات إغلاق الإجراءات التصحيحية.", tags: ["متابعة", "إجراءات تصحيحية"], uploadedById: "user-monitor-1", organizationalUnitId: "ou-monitoring", planId: "plan-01" },
      { id: "doc-06", code: "KNW-006", titleAr: "مصطلحات موحدة للخطط والتقارير", documentType: "مرجع", summary: "قاموس مصطلحات يساعد على توحيد الصياغات المؤسسية.", tags: ["مصطلحات", "حوكمة", "تقارير"], uploadedById: "user-reader", organizationalUnitId: "ou-planning" },
      { id: "doc-07", code: "KNW-007", titleAr: "نموذج أثر ما بعد التدريب", documentType: "نموذج", summary: "نموذج موحد لتقييم أثر البرامج التدريبية بعد التنفيذ.", tags: ["تدريب", "قياس أثر"], uploadedById: "user-training-1", organizationalUnitId: "ou-training", trainingProgramId: "training-01" },
      { id: "doc-08", code: "KNW-008", titleAr: "ملخص تنفيذي للتقارير المرجعية 2025", documentType: "ملخص تنفيذي", summary: "أبرز الدروس المستفادة من التقارير المرجعية السابقة للبعثات.", tags: ["بعثات", "دروس مستفادة", "ملخص تنفيذي"], uploadedById: "user-plan-manager", organizationalUnitId: "ou-planning", missionReportId: "report-04" }
    ]
  });

  await prisma.approvalRequest.createMany({
    data: [
      { id: "approval-01", titleAr: "اعتماد الخطة المؤسسية 2026-2028", description: "الطلب مرفوع من إدارة التخطيط لاعتماد الخطة المؤسسية.", entityType: "PLAN", entityId: "plan-01", status: "PENDING", requesterId: "user-plan-manager", assignedToId: "user-dg", dueDate: d("2026-04-22T00:00:00Z"), planId: "plan-01" },
      { id: "approval-02", titleAr: "اعتماد دورة المتابعة للربع الأول 2026", description: "إحالة دورة المتابعة للاعتماد التنفيذي وإقرار الإجراءات التصحيحية.", entityType: "MONITORING_CYCLE", entityId: "cycle-01", status: "PENDING", requesterId: "user-monitor-1", assignedToId: "user-monitor-manager", dueDate: d("2026-04-20T00:00:00Z"), monitoringCycleId: "cycle-01" },
      { id: "approval-03", titleAr: "اعتماد برنامج بناء مؤشرات الأداء المؤسسي", description: "نشر الفرصة التدريبية واعتماد المقاعد المخصصة للإدارات.", entityType: "TRAINING_PROGRAM", entityId: "training-01", status: "APPROVED", requesterId: "user-training-1", assignedToId: "user-dg", actedAt: d("2026-04-12T09:00:00Z"), decisionComment: "معتمد مع إعطاء أولوية لمحللي التخطيط ومسؤولي المتابعة." },
      { id: "approval-04", titleAr: "اعتماد ترشيح منسق بعثة الرياض", description: "ترشيح للمشاركة في ورشة التقارير الدبلوماسية.", entityType: "TRAINING_NOMINATION", entityId: "nom-03", status: "PENDING", requesterId: "user-riyadh-1", assignedToId: "user-plan-manager", dueDate: d("2026-04-21T00:00:00Z"), trainingNominationId: "nom-03" },
      { id: "approval-05", titleAr: "اعتماد تقرير القاهرة النصف سنوي", description: "التقرير أُعيد لاستكمال الشواهد قبل الاعتماد النهائي.", entityType: "MISSION_REPORT", entityId: "report-03", status: "RETURNED", requesterId: "user-cairo-1", assignedToId: "user-plan-manager", actedAt: d("2026-04-12T10:30:00Z"), decisionComment: "استكمال فقرة الأثر النوعي وإرفاق أدلة داعمة.", missionReportId: "report-03" },
      { id: "approval-06", titleAr: "اعتماد قالب النتائج والإجراءات", description: "القالب في مرحلة المسودة ويحتاج مراجعة قبل التفعيل.", entityType: "TEMPLATE", entityId: "tmpl-results", status: "PENDING", requesterId: "user-plan-manager", assignedToId: "user-dg", dueDate: d("2026-04-25T00:00:00Z"), templateId: "tmpl-results" },
      { id: "approval-07", titleAr: "اعتماد تقرير الربع الأول - بعثة القاهرة", description: "بانتظار اعتماد التقرير بعد استكمال المتطلبات الأساسية.", entityType: "MISSION_REPORT", entityId: "report-06", status: "PENDING", requesterId: "user-cairo-1", assignedToId: "user-plan-manager", dueDate: d("2026-04-19T00:00:00Z"), missionReportId: "report-06" },
      { id: "approval-08", titleAr: "اعتماد النصف الأول 2026 لخطة البعثات", description: "إقرار وضع الخطة التشغيلية الخاصة بالتقارير والاعتمادات.", entityType: "PLAN", entityId: "plan-02", status: "APPROVED", requesterId: "user-plan-manager", assignedToId: "user-dg", actedAt: d("2026-01-28T09:30:00Z"), decisionComment: "معتمد مع متابعة شهرية على مؤشرات زمن الاعتماد.", planId: "plan-02" }
    ]
  });

  await prisma.notification.createMany({
    data: [
      { id: "notif-01", userId: "user-dg", titleAr: "طلب اعتماد جديد", messageAr: "الخطة المؤسسية 2026-2028 بانتظار اعتمادكم.", type: "APPROVAL", link: "/approvals" },
      { id: "notif-02", userId: "user-plan-manager", titleAr: "تقرير مُعاد للاستكمال", messageAr: "أُعيد تقرير بعثة القاهرة النصف سنوي مع ملاحظات مراجعة.", type: "REPORT", link: "/reports/report-03" },
      { id: "notif-03", userId: "user-monitor-manager", titleAr: "دورة متابعة بانتظار المراجعة", messageAr: "دورة المتابعة للربع الأول 2026 بانتظار الإقرار النهائي.", type: "APPROVAL", link: "/monitoring/cycle-01" },
      { id: "notif-04", userId: "user-training-1", titleAr: "موعد إغلاق الترشيحات قريب", messageAr: "تبقى 3 أيام على إغلاق الترشيح لبرنامج مؤشرات الأداء.", type: "TRAINING", link: "/training/training-01" },
      { id: "notif-05", userId: "user-riyadh-1", titleAr: "ملاحظات على نموذج التقرير", messageAr: "تم تحديث دليل المستخدم وإضافة توضيحات حول الحقول التحليلية.", type: "SYSTEM", link: "/knowledge/doc-03" },
      { id: "notif-06", userId: "user-planner-1", titleAr: "مؤشر يحتاج متابعة", messageAr: "مؤشر اكتمال حقول الخطط يحتاج استكمال بيانات إدارتين.", type: "ALERT", link: "/kpis/kpi-02" },
      { id: "notif-07", userId: "user-admin", titleAr: "مبادرة ذات مخاطر مرتفعة", messageAr: "مسار رقمنة الاعتماد يحتاج تجربة موسعة قبل التعميم.", type: "ALERT", link: "/initiatives/init-06" },
      { id: "notif-08", userId: "user-cairo-1", titleAr: "اعتماد التقرير قيد الانتظار", messageAr: "تقرير الربع الأول 2026 تم استلامه وبانتظار مراجعة الإدارة.", type: "REPORT", link: "/reports/report-06" },
      { id: "notif-09", userId: "user-plan-manager", titleAr: "ترشيح تدريبي جديد", messageAr: "منسق بعثة الرياض طلب الانضمام إلى ورشة التقارير الدبلوماسية.", type: "TRAINING", link: "/training/training-02" },
      { id: "notif-10", userId: "user-reader", titleAr: "وثيقة معرفية جديدة", messageAr: "أضيفت حقيبة ورشة التقارير الدبلوماسية إلى مكتبة المعرفة.", type: "SYSTEM", link: "/knowledge/doc-04" }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { id: "audit-01", actorId: "user-planner-1", action: "CREATE_TEMPLATE", entityType: "Template", entityId: "tmpl-strategy", description: "أنشأت محللة التخطيط قالب الأولويات والأهداف الاستراتيجية." },
      { id: "audit-02", actorId: "user-planner-1", action: "CREATE_PLAN", entityType: "Plan", entityId: "plan-01", description: "تم إنشاء الخطة المؤسسية 2026-2028 من القالب الاستراتيجي." },
      { id: "audit-03", actorId: "user-plan-manager", action: "SUBMIT_PLAN", entityType: "Plan", entityId: "plan-01", description: "رفع مدير إدارة التخطيط الخطة المؤسسية للاعتماد." },
      { id: "audit-04", actorId: "user-monitor-1", action: "OPEN_MONITORING_CYCLE", entityType: "MonitoringCycle", entityId: "cycle-01", description: "تم فتح دورة متابعة الربع الأول 2026." },
      { id: "audit-05", actorId: "user-cairo-1", action: "SUBMIT_REPORT", entityType: "MissionReport", entityId: "report-03", description: "تم رفع تقرير بعثة القاهرة للنصف الأول 2026." },
      { id: "audit-06", actorId: "user-plan-manager", action: "RETURN_REPORT", entityType: "MissionReport", entityId: "report-03", description: "أُعيد التقرير إلى البعثة مع ملاحظات استكمال." },
      { id: "audit-07", actorId: "user-training-1", action: "PUBLISH_TRAINING", entityType: "TrainingProgram", entityId: "training-01", description: "نشر برنامج بناء مؤشرات الأداء المؤسسي." },
      { id: "audit-08", actorId: "user-riyadh-1", action: "SUBMIT_NOMINATION", entityType: "TrainingNomination", entityId: "nom-03", description: "قدمت بعثة الرياض طلب ترشيح للورشة التدريبية." },
      { id: "audit-09", actorId: "user-admin", action: "UPDATE_WORKFLOW", entityType: "Initiative", entityId: "init-06", description: "تم تحديث مبادرة رقمنة الاعتماد وربطها بالتنبيهات." },
      { id: "audit-10", actorId: "user-training-1", action: "UPLOAD_KNOWLEDGE", entityType: "KnowledgeDocument", entityId: "doc-04", description: "تمت إضافة حقيبة ورشة التقارير الدبلوماسية إلى مكتبة المعرفة." },
      { id: "audit-11", actorId: "user-monitor-manager", action: "REVIEW_UPDATE", entityType: "MonitoringUpdate", entityId: "mu-03", description: "راجعت إدارة المتابعة تحديثًا وأعادته لاستكمال المقارنة المرجعية." },
      { id: "audit-12", actorId: "user-dg", action: "APPROVE_PLAN", entityType: "Plan", entityId: "plan-02", description: "اعتمد المدير العام خطة تطوير التقارير الدبلوماسية والبعثات 2026." }
    ]
  });

  console.log("Database seeded with institutional Arabic demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
