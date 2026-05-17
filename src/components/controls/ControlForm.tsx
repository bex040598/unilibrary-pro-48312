import { FormEvent, useState } from "react";
import { SecurityControl } from "../../types";

const frameworks = ["ISO/IEC 27001", "NIST CSF 2.0", "NIST SP 800-30", "CIS Controls", "OWASP ASVS", "PCI DSS", "SOC 2"];
const types = ["Preventive", "Detective", "Corrective", "Administrative", "Technical", "Physical"];
const effectiveness = [
  { label: "Juda kuchli", score: 0.2 },
  { label: "Kuchli", score: 0.4 },
  { label: "O'rta", score: 0.6 },
  { label: "Zaif", score: 0.8 },
  { label: "Mavjud emas", score: 1 },
];

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)] focus:bg-white";

export function ControlForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: SecurityControl | null;
  onSubmit: (value: Omit<SecurityControl, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<SecurityControl, "id" | "createdAt">>(
    initialValue
      ? {
          controlName: initialValue.controlName,
          framework: initialValue.framework,
          controlType: initialValue.controlType,
          description: initialValue.description,
          effectivenessLevel: initialValue.effectivenessLevel,
          effectivenessScore: initialValue.effectivenessScore,
          implementationStatus: initialValue.implementationStatus,
          owner: initialValue.owner,
        }
      : {
          controlName: "",
          framework: frameworks[0],
          controlType: types[0],
          description: "",
          effectivenessLevel: "O'rta",
          effectivenessScore: 0.6,
          implementationStatus: "Implemented",
          owner: "",
        },
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Nazorat nomi
          <input
            required
            className={inputClass}
            value={form.controlName}
            onChange={(event) => setForm({ ...form, controlName: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Framework
          <select
            className={inputClass}
            value={form.framework}
            onChange={(event) => setForm({ ...form, framework: event.target.value })}
          >
            {frameworks.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Nazorat turi
          <select
            className={inputClass}
            value={form.controlType}
            onChange={(event) => setForm({ ...form, controlType: event.target.value })}
          >
            {types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Implementation status
          <select
            className={inputClass}
            value={form.implementationStatus}
            onChange={(event) =>
              setForm({
                ...form,
                implementationStatus: event.target.value as SecurityControl["implementationStatus"],
              })
            }
          >
            <option>Implemented</option>
            <option>Partially Implemented</option>
            <option>Not Implemented</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Control weakness
          <select
            className={inputClass}
            value={form.effectivenessLevel}
            onChange={(event) => {
              const selected = effectiveness.find((item) => item.label === event.target.value);
              setForm({
                ...form,
                effectivenessLevel: event.target.value as SecurityControl["effectivenessLevel"],
                effectivenessScore: selected?.score ?? form.effectivenessScore,
              });
            }}
          >
            {effectiveness.map((item) => (
              <option key={item.label}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Owner
          <input
            required
            className={inputClass}
            value={form.owner}
            onChange={(event) => setForm({ ...form, owner: event.target.value })}
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Tavsif
        <textarea
          rows={4}
          className={inputClass}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15446f]"
        >
          Saqlash
        </button>
      </div>
    </form>
  );
}
