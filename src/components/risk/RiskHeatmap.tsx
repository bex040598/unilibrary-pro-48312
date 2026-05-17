import { Fragment } from "react";
import { RiskAssessment } from "../../types";
import { calculateRisk } from "../../lib/riskCalculator";
import { cn } from "../../lib/utils";

const probabilities = [0.1, 0.3, 0.5, 0.7, 0.9];
const impacts = [1, 2, 3, 4, 5];

function heatTone(score: number) {
  if (score <= 24) return "from-emerald-100 to-emerald-50";
  if (score <= 49) return "from-amber-100 to-amber-50";
  if (score <= 74) return "from-orange-100 to-orange-50";
  return "from-rose-100 to-rose-50";
}

export function RiskHeatmap({
  assessments,
  focusProbability,
  focusImpact,
}: {
  assessments: RiskAssessment[];
  focusProbability?: number;
  focusImpact?: number;
}) {
  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">Risk heatmap</h3>
        <p className="mt-1 text-sm text-slate-500">Probability va impact kombinatsiyalari bo'yicha issiqlik xaritasi</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[140px_repeat(5,minmax(0,1fr))] gap-3">
            <div />
            {impacts.map((impact) => (
              <div key={impact} className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Impact {impact}
              </div>
            ))}
            {probabilities.map((probability) => (
              <Fragment key={probability}>
                <div
                  key={`prob-${probability}`}
                  className="flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  P={probability}
                </div>
                {impacts.map((impact) => {
                  const preview = calculateRisk({
                    threatProbability: probability,
                    vulnerabilityLevel: 0.75,
                    impactValue: impact / 5,
                    controlWeakness: 0.8,
                  });
                  const matching = assessments.filter(
                    (assessment) =>
                      assessment.threatProbability === probability &&
                      Math.round(assessment.impactValue * 5) === impact,
                  );
                  const focused = focusProbability === probability && Math.round((focusImpact ?? 0) * 5) === impact;

                  return (
                    <div
                      key={`${probability}-${impact}`}
                      className={cn(
                        "rounded-2xl border border-white/60 bg-gradient-to-br p-4 shadow-sm",
                        heatTone(preview.score),
                        focused && "ring-4 ring-[var(--primary)]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-700">{preview.level}</span>
                        <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-700">
                          {matching.length}
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-extrabold text-slate-950">{preview.score}</p>
                      <p className="mt-1 text-xs text-slate-500">Taxminiy score</p>
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
