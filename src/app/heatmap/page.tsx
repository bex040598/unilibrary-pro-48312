import { RiskHeatmap } from "../../components/risk/RiskHeatmap";
import { RiskLevelBadge } from "../../components/risk/RiskLevelBadge";
import { usePlatform } from "../../lib/platform-context";

export function HeatmapPage() {
  const { riskAssessments, assets, threats } = usePlatform();
  const latest = riskAssessments[0];

  return (
    <div className="space-y-6">
      {latest ? (
        <div className="panel rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Fokuslangan assessment</h3>
              <p className="mt-1 text-sm text-slate-500">
                {assets.find((item) => item.id === latest.assetId)?.assetName} |{" "}
                {threats.find((item) => item.id === latest.threatId)?.threatName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RiskLevelBadge level={latest.riskLevel} />
              <span className="text-2xl font-extrabold text-slate-950">{latest.riskScore}</span>
            </div>
          </div>
        </div>
      ) : null}
      <RiskHeatmap assessments={riskAssessments} focusProbability={latest?.threatProbability} focusImpact={latest?.impactValue} />
    </div>
  );
}
