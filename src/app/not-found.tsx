import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbfa_0%,#edf2f0_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-[32px] border border-border/70 bg-white p-8 shadow-panel">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-500">404</p>
          <h1 className="text-3xl font-bold text-dashboard-ink">
            الصفحة المطلوبة غير متاحة
          </h1>
          <p className="text-base leading-8 text-muted-foreground">
            قد يكون الرابط غير صحيح أو أن العنصر المطلوب لم يعد موجودًا ضمن بيئة
            العرض الحالية.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-dashboard-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            الانتقال إلى لوحة القيادة
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-dashboard-ink transition hover:bg-slate-50"
          >
            اختيار دور العرض
          </Link>
        </div>
      </div>
    </main>
  );
}
