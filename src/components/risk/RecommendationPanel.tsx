export function RecommendationPanel({
  title = "Tavsiya etilgan choralar",
  recommendations,
}: {
  title?: string;
  recommendations: string[];
}) {
  return (
    <div className="panel rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {recommendations.map((recommendation, index) => (
          <div key={`${recommendation}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm leading-6 text-slate-700">{recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
