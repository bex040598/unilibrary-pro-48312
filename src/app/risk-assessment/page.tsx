import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecommendationPanel } from "../../components/risk/RecommendationPanel";
import { RiskAssessmentForm } from "../../components/risk/RiskAssessmentForm";
import { RiskFormulaCard } from "../../components/risk/RiskFormulaCard";
import { RiskHeatmap } from "../../components/risk/RiskHeatmap";
import { RiskLevelBadge } from "../../components/risk/RiskLevelBadge";
import { RiskMatrix } from "../../components/risk/RiskMatrix";
import { RiskScoreGauge } from "../../components/risk/RiskScoreGauge";
import { usePlatform } from "../../lib/platform-context";
import { generateRecommendation } from "../../lib/recommendationEngine";
import { calculateRisk, getRiskLevelDescription } from "../../lib/riskCalculator";
import { getAssetImpactAverage, getAssetImpactValue } from "../../lib/utils";

export function RiskAssessmentPage() {
  const navigate = useNavigate();
  const { assets, threats, vulnerabilities, controls, riskAssessments, createRiskAssessment } = usePlatform();

  const [selection, setSelection] = useState({
    assetId: assets[0]?.id ?? "",
    threatId: threats[0]?.id ?? "",
    vulnerabilityId: vulnerabilities[0]?.id ?? "",
    controlId: controls[0]?.id ?? "",
  });

  const asset = assets.find((item) => item.id === selection.assetId) ?? assets[0];
  const threat = threats.find((item) => item.id === selection.threatId) ?? threats[0];
  const assetScopedVulnerability =
    vulnerabilities.find((item) => item.id === selection.vulnerabilityId) ??
    vulnerabilities.find((item) => item.affectedAsset === selection.assetId) ??
    vulnerabilities[0];
  const control = controls.find((item) => item.id === selection.controlId) ?? controls[0];

  const liveResult = useMemo(() => {
    if (!asset || !threat || !assetScopedVulnerability || !control) {
      return null;
    }
    return calculateRisk({
      threatProbability: threat.probability,
      vulnerabilityLevel: assetScopedVulnerability.severityScore,
      impactValue: getAssetImpactValue(asset),
      controlWeakness: control.effectivenessScore,
    });
  }, [asset, assetScopedVulnerability, control, threat]);

  const liveRecommendations = useMemo(
    () => generateRecommendation(liveResult?.level ?? "Past", threat?.category ?? ""),
    [liveResult?.level, threat?.category],
  );

  function handleSave() {
    const created = createRiskAssessment({
      assetId: selection.assetId,
      threatId: selection.threatId,
      vulnerabilityId: assetScopedVulnerability.id,
      controlId: selection.controlId,
    });

    if (created) {
      window.alert("Risk baholash saqlandi.");
    }
  }

  if (!asset || !threat || !assetScopedVulnerability || !control || !liveResult) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RiskAssessmentForm
          assets={assets}
          threats={threats}
          vulnerabilities={vulnerabilities}
          controls={controls}
          value={selection}
          onChange={setSelection}
          onSubmit={handleSave}
        />

        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <RiskScoreGauge score={liveResult.score} level={liveResult.level} />
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Risk natijasi</h3>
                  <p className="mt-1 text-sm text-slate-500">Real-time formula asosida hisoblangan xulosa</p>
                </div>
                <RiskLevelBadge level={liveResult.level} />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Baholanayotgan aktiv</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{asset.assetName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tanlangan tahdid</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{threat.threatName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tanlangan zaiflik</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{assetScopedVulnerability.vulnerabilityName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nazorat chorasi</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{control.controlName}</p>
                </div>
              </div>
              <div className="mt-5 rounded-3xl bg-[var(--primary)] p-5 text-white">
                <p className="text-sm text-blue-100">Ilmiy izoh</p>
                <p className="mt-2 text-sm leading-7 text-white/90">
                  {getRiskLevelDescription(liveResult.level)} Aktivning CIA o'rtachasi {getAssetImpactAverage(asset).toFixed(2)}
                  , tahdid ehtimolligi {threat.probability}, zaiflik darajasi {assetScopedVulnerability.severityScore} va
                  nazorat zaifligi {control.effectivenessScore} bilan hisobga olindi.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/reports")}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Hisobotga o'tish
                  </span>
                </button>
              </div>
            </div>
          </div>
          <RiskFormulaCard
            threatProbability={threat.probability}
            vulnerabilityLevel={assetScopedVulnerability.severityScore}
            impactValue={getAssetImpactValue(asset)}
            controlWeakness={control.effectivenessScore}
            score={liveResult.score}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RecommendationPanel recommendations={liveRecommendations} />
        <RiskHeatmap
          assessments={riskAssessments}
          focusProbability={threat.probability}
          focusImpact={getAssetImpactValue(asset)}
        />
      </div>

      <RiskMatrix
        assessments={riskAssessments}
        highlightedAssessment={{
          id: "preview",
          assetId: asset.id,
          threatId: threat.id,
          vulnerabilityId: assetScopedVulnerability.id,
          controlId: control.id,
          threatProbability: threat.probability,
          vulnerabilityLevel: assetScopedVulnerability.severityScore,
          impactValue: getAssetImpactValue(asset),
          controlWeakness: control.effectivenessScore,
          riskScore: liveResult.score,
          riskLevel: liveResult.level,
          recommendations: [],
          assessedBy: "preview",
          createdAt: new Date().toISOString(),
        }}
      />
    </div>
  );
}
