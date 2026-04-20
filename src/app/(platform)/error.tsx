"use client";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlatformError({ reset }: PlatformErrorProps) {
  return (
    <div className="page-shell">
      <div className="rounded-[32px] border border-border/70 bg-white p-8 shadow-panel">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-amber-700">تنبيه تشغيلي</p>
          <h1 className="text-2xl font-bold text-dashboard-ink">
            تعذر عرض هذه الشاشة بالشكل المطلوب
          </h1>
          <p className="text-base leading-8 text-muted-foreground">
            هذا لا يعني أن النظام غير متاح بالكامل، لكن هذه الصفحة تحتاج إعادة تحميل
            أو مراجعة بياناتها الحالية.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-dashboard-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            إعادة المحاولة
          </button>
          <a
            href="/dashboard"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-dashboard-ink transition hover:bg-slate-50"
          >
            العودة إلى لوحة القيادة
          </a>
        </div>
      </div>
    </div>
  );
}
