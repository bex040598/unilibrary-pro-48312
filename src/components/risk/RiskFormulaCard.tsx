interface FormulaCardProps {
  threatProbability: number;
  vulnerabilityLevel: number;
  impactValue: number;
  controlWeakness: number;
  score: number;
}

export function RiskFormulaCard({
  threatProbability,
  vulnerabilityLevel,
  impactValue,
  controlWeakness,
  score,
}: FormulaCardProps) {
  return (
    <div className="panel panel-accent rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-slate-950">Ilmiy formula</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Risk Score = P(T) x V x I x C x 100
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">P(T)</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{threatProbability.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">V</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{vulnerabilityLevel.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">I</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{impactValue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">C</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{controlWeakness.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-[var(--primary)] px-5 py-4 text-white">
        <p className="text-sm text-blue-100">Natija</p>
        <p className="mt-1 text-3xl font-extrabold">{score}</p>
      </div>
    </div>
  );
}
