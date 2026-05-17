import { FormEvent } from "react";
import { Asset, SecurityControl, Threat, Vulnerability } from "../../types";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)] focus:bg-white";

export interface AssessmentSelection {
  assetId: string;
  threatId: string;
  vulnerabilityId: string;
  controlId: string;
}

export function RiskAssessmentForm({
  assets,
  threats,
  vulnerabilities,
  controls,
  value,
  onChange,
  onSubmit,
}: {
  assets: Asset[];
  threats: Threat[];
  vulnerabilities: Vulnerability[];
  controls: SecurityControl[];
  value: AssessmentSelection;
  onChange: (value: AssessmentSelection) => void;
  onSubmit: () => void;
}) {
  const assetScopedVulnerabilities = vulnerabilities.filter(
    (item) => !value.assetId || item.affectedAsset === value.assetId,
  );
  const effectiveVulnerabilityId = value.vulnerabilityId || assetScopedVulnerabilities[0]?.id || "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="panel rounded-3xl p-6" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-950">Risk assessment inputlari</h3>
      <p className="mt-1 text-sm text-slate-500">Aktiv, tahdid, zaiflik va nazoratni tanlang.</p>
      <div className="mt-6 grid gap-5">
        <label className="text-sm font-medium text-slate-700">
          Aktiv
          <select
            required
            className={inputClass}
            value={value.assetId}
            onChange={(event) =>
              onChange({
                assetId: event.target.value,
                threatId: value.threatId,
                vulnerabilityId: "",
                controlId: value.controlId,
              })
            }
          >
            {assets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.assetName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tahdid
          <select
            required
            className={inputClass}
            value={value.threatId}
            onChange={(event) => onChange({ ...value, threatId: event.target.value })}
          >
            {threats.map((item) => (
              <option key={item.id} value={item.id}>
                {item.threatName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Zaiflik
          <select
            required
            className={inputClass}
            value={effectiveVulnerabilityId}
            onChange={(event) => onChange({ ...value, vulnerabilityId: event.target.value })}
          >
            {assetScopedVulnerabilities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.vulnerabilityName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Nazorat chorasi
          <select
            required
            className={inputClass}
            value={value.controlId}
            onChange={(event) => onChange({ ...value, controlId: event.target.value })}
          >
            {controls.map((item) => (
              <option key={item.id} value={item.id}>
                {item.controlName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15446f]"
        >
          Baholashni saqlash
        </button>
      </div>
    </form>
  );
}
