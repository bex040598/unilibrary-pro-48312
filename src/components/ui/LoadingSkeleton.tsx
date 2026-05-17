export function LoadingSkeleton({ variant = "panel" }: { variant?: "panel" | "screen" }) {
  if (variant === "screen") {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-14 rounded-2xl bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-32 rounded-3xl bg-slate-200" />
            ))}
          </div>
          <div className="h-[420px] rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />;
}
