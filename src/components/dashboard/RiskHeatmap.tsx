import { RiskAssessment } from "../../types";
import { RiskHeatmap as BaseHeatmap } from "../risk/RiskHeatmap";

export function RiskHeatmap({ assessments }: { assessments: RiskAssessment[] }) {
  return <BaseHeatmap assessments={assessments} />;
}
