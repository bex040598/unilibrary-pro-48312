import { Asset, RiskAssessment, Threat } from "../../types";
import { RiskLevelBadge } from "../risk/RiskLevelBadge";

export function CriticalRiskTable({
  assessments,
  assets,
  threats,
}: {
  assessments: RiskAssessment[];
  assets: Asset[];
  threats: Threat[];
}) {
  const critical = assessments
    .filter((item) => item.riskLevel === "Kritik" || item.riskLevel === "Yuqori")
    .slice(0, 6);

  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Kritik risklar ro'yxati</h3>
        <p className="mt-1 text-sm text-slate-500">Rahbariyat e'tiboriga loyiq risklar</p>
      </div>
      <div className="space-y-3">
        {critical.map((assessment) => (
          <div key={assessment.id} className="rounded-2xl border border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {assets.find((asset) => asset.id === assessment.assetId)?.assetName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {threats.find((threat) => threat.id === assessment.threatId)?.threatName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <RiskLevelBadge level={assessment.riskLevel} />
                <span className="text-lg font-bold text-slate-950">{assessment.riskScore}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
