import {
  Activity,
  AlertTriangle,
  Database,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  Triangle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CriticalRiskTable } from "../../components/dashboard/CriticalRiskTable";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { RecentActivity } from "../../components/dashboard/RecentActivity";
import { RiskHeatmap } from "../../components/dashboard/RiskHeatmap";
import { RiskPieChart } from "../../components/dashboard/RiskPieChart";
import { RiskTrendChart } from "../../components/dashboard/RiskTrendChart";
import { RecommendationPanel } from "../../components/risk/RecommendationPanel";
import { usePlatform } from "../../lib/platform-context";
import { formatDate } from "../../lib/utils";

export function DashboardPage() {
  const { assets, threats, vulnerabilities, controls, riskAssessments, auditLogs } = usePlatform();
  const criticalCount = riskAssessments.filter((item) => item.riskLevel === "Kritik").length;
  const averageRisk =
    riskAssessments.length === 0
      ? 0
      : Math.round(riskAssessments.reduce((sum, item) => sum + item.riskScore, 0) / riskAssessments.length);
  const lastAudit = auditLogs[0]?.createdAt ?? new Date().toISOString();
  const assetRiskData = assets.map((asset) => {
    const related = riskAssessments.filter((item) => item.assetId === asset.id);
    const average =
      related.length === 0 ? 0 : Math.round(related.reduce((sum, item) => sum + item.riskScore, 0) / related.length);
    return { name: asset.assetName.slice(0, 14), score: average };
  });
  const threatCategoryData = threats.map((threat) => ({
    name: threat.category,
    value: riskAssessments.filter((item) => item.threatId === threat.id).length,
  }));
  const controlData = controls.map((control) => ({
    name: control.controlName.slice(0, 12),
    value: Math.round((1 - control.effectivenessScore) * 100),
  }));
  const recommendationSample = riskAssessments[0]?.recommendations ?? [
    "Topilgan kritik risklar bo'yicha tezkor mitigatsiya planini boshqaruv kengashiga taqdim eting.",
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Umumiy aktivlar" value={String(assets.length)} icon={<Database className="h-6 w-6" />} accent="bg-blue-600" description="Platformadagi inventar yozuvlari" />
        <KpiCard title="Tahdidlar soni" value={String(threats.length)} icon={<ShieldAlert className="h-6 w-6" />} accent="bg-cyan-600" description="Aktiv tahdid katalogi" />
        <KpiCard title="Zaifliklar" value={String(vulnerabilities.length)} icon={<Triangle className="h-6 w-6" />} accent="bg-orange-500" description="Baholangan zaifliklar reyestri" />
        <KpiCard title="Kritik risklar" value={String(criticalCount)} icon={<AlertTriangle className="h-6 w-6" />} accent="bg-rose-500" description="Zudlik bilan choralar talab qilinadi" />
        <KpiCard title="Baholashlar" value={String(riskAssessments.length)} icon={<Activity className="h-6 w-6" />} accent="bg-violet-600" description="Yakunlangan risk assessment lar" />
        <KpiCard title="O'rtacha risk" value={String(averageRisk)} icon={<Gauge className="h-6 w-6" />} accent="bg-slate-800" description="Score bo'yicha umumiy ko'rsatkich" />
        <KpiCard title="Nazoratlar" value={String(controls.length)} icon={<ShieldCheck className="h-6 w-6" />} accent="bg-emerald-600" description="Control catalog va weakness koeffitsiyenti" />
        <KpiCard title="Oxirgi audit" value={formatDate(lastAudit)} icon={<TimerReset className="h-6 w-6" />} accent="bg-sky-700" description="Eng so'nggi audit log sanasi" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RiskPieChart assessments={riskAssessments} />
        <RiskTrendChart assessments={riskAssessments} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel rounded-3xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-950">Aktivlar bo'yicha risk bar chart</h3>
            <p className="mt-1 text-sm text-slate-500">Har bir aktivning o'rtacha risk score ko'rsatkichi</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9e1ea" />
                <XAxis dataKey="name" tick={{ fill: "#667085", fontSize: 12 }} />
                <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#1E5AA8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-3xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-950">Tahdid va nazorat statistikasi</h3>
            <p className="mt-1 text-sm text-slate-500">Tahdid category va control effectiveness overview</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {threatCategoryData.slice(0, 6).map((item) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold text-slate-950">{item.value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-[var(--orange)]" style={{ width: `${Math.min(item.value * 18, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {controlData.slice(0, 6).map((item) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold text-slate-950">{item.value}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RiskHeatmap assessments={riskAssessments} />
        <CriticalRiskTable assessments={riskAssessments} assets={assets} threats={threats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RecommendationPanel title="Strategik tavsiyalar paneli" recommendations={recommendationSample} />
        <RecentActivity logs={auditLogs} />
      </div>
    </div>
  );
}
