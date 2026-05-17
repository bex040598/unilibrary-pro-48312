import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { RiskAssessment } from "../../types";

const colors = {
  Past: "#12B76A",
  "O'rta": "#FACC15",
  Yuqori: "#F79009",
  Kritik: "#F04438",
};

export function RiskPieChart({ assessments }: { assessments: RiskAssessment[] }) {
  const data = Object.entries(
    assessments.reduce<Record<string, number>>((accumulator, assessment) => {
      accumulator[assessment.riskLevel] = (accumulator[assessment.riskLevel] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Risk distribution</h3>
        <p className="mt-1 text-sm text-slate-500">Risk darajalari kesimidagi taqsimot</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.name as keyof typeof colors]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
