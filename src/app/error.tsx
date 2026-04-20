"use client";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ reset }: RootErrorProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbfa_0%,#edf2f0_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[32px] border border-border/70 bg-white p-8 shadow-panel">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-amber-700">حالة نظام</p>
          <h1 className="text-3xl font-bold text-dashboard-ink">
            حدث خلل أثناء تحميل الصفحة
          </h1>
          <p className="text-base leading-8 text-muted-foreground">
            تعذر إكمال الطلب في هذه اللحظة. يمكنك إعادة المحاولة مباشرة، وإذا استمر
            الخلل في بيئة العرض فراجع إعدادات قاعدة البيانات والمتغيرات البيئية.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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
    </main>
  );
}
