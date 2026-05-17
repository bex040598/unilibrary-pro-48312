import { Fragment } from "react";
import { RiskAssessment } from "../../types";
import { calculateRisk } from "../../lib/riskCalculator";
import { cn } from "../../lib/utils";
import { RiskLevelBadge } from "./RiskLevelBadge";

const probabilities = [0.1, 0.3, 0.5, 0.7, 0.9];
const impacts = [1, 2, 3, 4, 5];

function matrixTone(score: number) {
  if (score <= 24) return "bg-emerald-100";
  if (score <= 49) return "bg-amber-100";
  if (score <= 74) return "bg-orange-100";
  return "bg-rose-100";
}

export function RiskMatrix({
  assessments,
  highlightedAssessment,
}: {
  assessments: RiskAssessment[];
  highlightedAssessment?: RiskAssessment | null;
}) {
  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Risk matritsa</h3>
          <p className="mt-1 text-sm text-slate-500">5x5 ehtimollik va impact ko'rinishi</p>
        </div>
        {highlightedAssessment ? <RiskLevelBadge level={highlightedAssessment.riskLevel} /> : null}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[160px_repeat(5,minmax(0,1fr))] gap-3">
            <div />
            {probabilities.map((probability) => (
              <div key={probability} className="px-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {probability}
              </div>
            ))}
            {impacts.map((impact) => (
              <Fragment key={impact}>
                <div
                  key={`label-${impact}`}
                  className="flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                >
                  Impact {impact}
                </div>
                {probabilities.map((probability) => {
                  const preview = calculateRisk({
                    threatProbability: probability,
                    vulnerabilityLevel: 1,
                    impactValue: impact / 5,
                    controlWeakness: 1,
                  });
                  const count = assessments.filter((assessment) => {
                    const impactRank = Math.round(assessment.impactValue * 5);
                    const probabilityRank = probabilities.indexOf(assessment.threatProbability) + 1;
                    return impactRank === impact && probabilityRank === probabilities.indexOf(probability) + 1;
                  }).length;
                  const isHighlighted =
                    highlightedAssessment &&
                    Math.round(highlightedAssessment.impactValue * 5) === impact &&
                    highlightedAssessment.threatProbability === probability;

                  return (
                    <div
                      key={`${impact}-${probability}`}
                      className={cn(
                        "rounded-2xl border border-white/60 p-3 shadow-sm",
                        matrixTone(preview.score),
                        isHighlighted && "ring-4 ring-[var(--primary)]",
                      )}
                    >
                      <p className="text-xs text-slate-500">Score</p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">{preview.score}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">{preview.level}</p>
                      <p className="mt-3 text-xs text-slate-500">{count} ta assessment</p>
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
