import { FormEvent } from "react";
import { ReportRecord, RiskLevel } from "../../types";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)] focus:bg-white";

export interface ReportFormValue {
  organization: string;
  fromDate: string;
  toDate: string;
  riskLevel: ReportRecord["riskLevel"];
  format: ReportRecord["format"];
}

export function ReportBuilder({
  organizations,
  value,
  onChange,
  onGenerate,
}: {
  organizations: string[];
  value: ReportFormValue;
  onChange: (value: ReportFormValue) => void;
  onGenerate: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerate();
  }

  return (
    <form className="panel rounded-3xl p-6" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-950">Hisobot builder</h3>
      <p className="mt-1 text-sm text-slate-500">Tashkilot, sana oralig'i va risk darajasini tanlang.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Tashkilot
          <select className={inputClass} value={value.organization} onChange={(event) => onChange({ ...value, organization: event.target.value })}>
            {organizations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Risk darajasi
          <select
            className={inputClass}
            value={value.riskLevel}
            onChange={(event) => onChange({ ...value, riskLevel: event.target.value as RiskLevel | "Barchasi" })}
          >
            <option>Barchasi</option>
            <option>Past</option>
            <option>O'rta</option>
            <option>Yuqori</option>
            <option>Kritik</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Boshlanish sanasi
          <input type="date" className={inputClass} value={value.fromDate} onChange={(event) => onChange({ ...value, fromDate: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tugash sanasi
          <input type="date" className={inputClass} value={value.toDate} onChange={(event) => onChange({ ...value, toDate: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Format
          <select className={inputClass} value={value.format} onChange={(event) => onChange({ ...value, format: event.target.value as ReportRecord["format"] })}>
            <option>PDF</option>
            <option>DOCX</option>
            <option>XLSX</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15446f]"
        >
          Preview yaratish
        </button>
      </div>
    </form>
  );
}
