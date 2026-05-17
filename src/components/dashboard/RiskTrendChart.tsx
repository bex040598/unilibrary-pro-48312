import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RiskAssessment } from "../../types";

export function RiskTrendChart({ assessments }: { assessments: RiskAssessment[] }) {
  const data = assessments
    .slice()
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .map((assessment) => ({
      label: new Date(assessment.createdAt).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" }),
      score: assessment.riskScore,
    }));

  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Risk trend</h3>
        <p className="mt-1 text-sm text-slate-500">Assessment tarixidagi score o'zgarishi</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e1ea" />
            <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
            <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#1E5AA8" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
