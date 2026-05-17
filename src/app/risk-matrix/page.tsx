import { RiskMatrix } from "../../components/risk/RiskMatrix";
import { usePlatform } from "../../lib/platform-context";

export function RiskMatrixPage() {
  const { riskAssessments } = usePlatform();
  return (
    <div className="space-y-6">
      <RiskMatrix assessments={riskAssessments} />
      <div className="grid gap-5 md:grid-cols-4">
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Past</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {riskAssessments.filter((item) => item.riskLevel === "Past").length}
          </p>
        </div>
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">O'rta</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {riskAssessments.filter((item) => item.riskLevel === "O'rta").length}
          </p>
        </div>
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Yuqori</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {riskAssessments.filter((item) => item.riskLevel === "Yuqori").length}
          </p>
        </div>
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Kritik</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {riskAssessments.filter((item) => item.riskLevel === "Kritik").length}
          </p>
        </div>
      </div>
    </div>
  );
}
