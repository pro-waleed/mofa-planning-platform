export default function RootLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,109,98,0.12),transparent_30%),linear-gradient(180deg,#f8fbfa_0%,#eef3f0_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-12 w-72 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] border border-white/70 bg-white/80 shadow-soft"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="h-[360px] animate-pulse rounded-[32px] border border-white/70 bg-white/80 shadow-soft" />
          <div className="h-[360px] animate-pulse rounded-[32px] border border-white/70 bg-white/80 shadow-soft" />
        </div>
      </div>
    </main>
  );
}
