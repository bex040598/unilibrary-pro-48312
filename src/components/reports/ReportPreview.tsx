import { Asset, AuditLog, ReportRecord, RiskAssessment, Threat, Vulnerability } from "../../types";
import { RiskLevelBadge } from "../risk/RiskLevelBadge";
import { formatDate } from "../../lib/utils";

export function ReportPreview({
  report,
  assessments,
  assets,
  threats,
  vulnerabilities,
  auditLogs,
}: {
  report: ReportRecord | null;
  assessments: RiskAssessment[];
  assets: Asset[];
  threats: Threat[];
  vulnerabilities: Vulnerability[];
  auditLogs: AuditLog[];
}) {
  if (!report) {
    return (
      <div className="panel rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-slate-950">Hisobot preview</h3>
        <p className="mt-3 text-sm text-slate-500">
          Preview yaratish uchun chap tomondagi builder orqali hisobot parametrlarini tanlang.
        </p>
      </div>
    );
  }

  return (
    <div className="panel rounded-3xl p-6">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-2xl font-bold text-slate-950">CyberRisk executive preview</h3>
        <p className="mt-2 text-sm text-slate-500">{report.organization} uchun tayyorlangan boshqaruv xulosasi</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sana oralig'i</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatDate(report.fromDate)} - {formatDate(report.toDate)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk filter</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{report.riskLevel}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Format</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{report.format}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Prepared by</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{report.generatedBy}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Risk assessment jadvali</h4>
        <div className="mt-4 space-y-3">
          {assessments.slice(0, 5).map((assessment) => (
            <div key={assessment.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {assets.find((item) => item.id === assessment.assetId)?.assetName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {threats.find((item) => item.id === assessment.threatId)?.threatName} |{" "}
                    {vulnerabilities.find((item) => item.id === assessment.vulnerabilityId)?.vulnerabilityName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskLevelBadge level={assessment.riskLevel} />
                  <span className="text-lg font-bold text-slate-950">{assessment.riskScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Audit log summary</h4>
        <p className="mt-3 text-sm leading-6 text-slate-700">{auditLogs.length} ta audit yozuvi ushbu preview kontekstida hisobga olindi.</p>
      </div>
    </div>
  );
}
