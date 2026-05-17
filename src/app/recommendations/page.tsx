import { useMemo, useState } from "react";
import { RecommendationPanel } from "../../components/risk/RecommendationPanel";
import { RiskLevelBadge } from "../../components/risk/RiskLevelBadge";
import { usePlatform } from "../../lib/platform-context";

export function RecommendationsPage() {
  const { riskAssessments, assets, threats } = usePlatform();
  const [filter, setFilter] = useState("Barchasi");
  const filtered = useMemo(
    () => riskAssessments.filter((item) => filter === "Barchasi" || item.riskLevel === filter),
    [filter, riskAssessments],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        >
          <option>Barchasi</option>
          <option>Past</option>
          <option>O'rta</option>
          <option>Yuqori</option>
          <option>Kritik</option>
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {filtered.map((assessment) => (
          <div key={assessment.id} className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {assets.find((item) => item.id === assessment.assetId)?.assetName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {threats.find((item) => item.id === assessment.threatId)?.threatName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskLevelBadge level={assessment.riskLevel} />
                  <span className="text-xl font-extrabold text-slate-950">{assessment.riskScore}</span>
                </div>
              </div>
            </div>
            <RecommendationPanel title="Mitigatsiya tavsiyalari" recommendations={assessment.recommendations} />
          </div>
        ))}
      </div>
    </div>
  );
}
