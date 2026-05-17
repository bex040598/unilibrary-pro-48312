import { RiskLevel } from "../../types";
import { riskLevelColor } from "../../lib/utils";

export function RiskScoreGauge({ score, level }: { score: number; level: RiskLevel }) {
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(score, 100);
  const offset = circumference - (clamped / 100) * circumference;
  const color = riskLevelColor(level);

  return (
    <div className="panel rounded-3xl p-6">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <svg viewBox="0 0 220 220" className="h-56 w-56">
          <circle cx="110" cy="110" r={radius} stroke="#e6edf4" strokeWidth="18" fill="none" />
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke={color}
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 110 110)"
          />
          <circle cx="110" cy="110" r="70" fill="#ffffff" />
          <text x="110" y="102" textAnchor="middle" className="fill-slate-400 text-[12px] uppercase tracking-[0.24em]">
            Risk score
          </text>
          <text x="110" y="128" textAnchor="middle" className="fill-slate-950 text-[32px] font-extrabold">
            {score}
          </text>
          <text x="110" y="148" textAnchor="middle" className="fill-slate-500 text-[14px] font-semibold">
            {level}
          </text>
        </svg>
      </div>
    </div>
  );
}
