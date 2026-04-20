export default function PlatformLoading() {
  return (
    <div className="space-y-6 page-shell">
      <div className="space-y-3">
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-6 w-[32rem] max-w-full animate-pulse rounded-2xl bg-white/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[28px] border border-border/70 bg-white shadow-panel"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-[32px] border border-border/70 bg-white shadow-panel" />
        <div className="h-[320px] animate-pulse rounded-[32px] border border-border/70 bg-white shadow-panel" />
      </div>
    </div>
  );
}
