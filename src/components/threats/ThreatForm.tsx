import { FormEvent, useState } from "react";
import { Threat } from "../../types";

const categories = [
  "Phishing",
  "Malware",
  "Ransomware",
  "SQL Injection",
  "XSS",
  "Brute-force",
  "DDoS",
  "Insider Threat",
  "Data Leakage",
  "Unauthorized Access",
  "API Abuse",
  "Zero-day Vulnerability",
  "Social Engineering",
  "Credential Stuffing",
  "Supply Chain Attack",
];

const probabilities = [
  { label: "Juda past", value: 0.1 },
  { label: "Past", value: 0.3 },
  { label: "O'rta", value: 0.5 },
  { label: "Yuqori", value: 0.7 },
  { label: "Juda yuqori", value: 0.9 },
];

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)] focus:bg-white";

export function ThreatForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: Threat | null;
  onSubmit: (value: Omit<Threat, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<Threat, "id" | "createdAt">>(
    initialValue
      ? {
          threatName: initialValue.threatName,
          category: initialValue.category,
          description: initialValue.description,
          probability: initialValue.probability,
          source: initialValue.source,
          severity: initialValue.severity,
        }
      : {
          threatName: "",
          category: categories[0],
          description: "",
          probability: 0.5,
          source: "External",
          severity: "O'rta",
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
          Tahdid nomi
          <input
            required
            className={inputClass}
            value={form.threatName}
            onChange={(event) => setForm({ ...form, threatName: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Kategoriya
          <select
            className={inputClass}
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Ehtimollik
          <select
            className={inputClass}
            value={form.probability}
            onChange={(event) => setForm({ ...form, probability: Number(event.target.value) })}
          >
            {probabilities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} ({item.value})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Manba
          <select
            className={inputClass}
            value={form.source}
            onChange={(event) => setForm({ ...form, source: event.target.value as Threat["source"] })}
          >
            <option>Internal</option>
            <option>External</option>
            <option>Hybrid</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Severity
          <select
            className={inputClass}
            value={form.severity}
            onChange={(event) => setForm({ ...form, severity: event.target.value as Threat["severity"] })}
          >
            <option>Past</option>
            <option>O'rta</option>
            <option>Yuqori</option>
            <option>Kritik</option>
          </select>
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
