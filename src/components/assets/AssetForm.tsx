import { FormEvent, useState } from "react";
import { Asset } from "../../types";

const assetTypes = [
  "Web ilova",
  "Server",
  "Ma'lumotlar bazasi",
  "API servis",
  "Tarmoq qurilmasi",
  "Foydalanuvchi akkaunti",
  "Bulutli xizmat",
  "Mobil ilova",
  "IoT qurilma",
  "Fayl server",
];

const criticalities = ["Past", "O'rta", "Yuqori", "Kritik"] as const;
const statuses = ["Active", "Inactive", "Under Review"] as const;
const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)] focus:bg-white";

export function AssetForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: Asset | null;
  onSubmit: (value: Omit<Asset, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<Asset, "id" | "createdAt">>(
    initialValue
      ? {
          assetName: initialValue.assetName,
          assetType: initialValue.assetType,
          organization: initialValue.organization,
          owner: initialValue.owner,
          criticality: initialValue.criticality,
          confidentialityScore: initialValue.confidentialityScore,
          integrityScore: initialValue.integrityScore,
          availabilityScore: initialValue.availabilityScore,
          businessImpact: initialValue.businessImpact,
          status: initialValue.status,
        }
      : {
          assetName: "",
          assetType: assetTypes[0],
          organization: "Digital University",
          owner: "",
          criticality: "O'rta",
          confidentialityScore: 3,
          integrityScore: 3,
          availabilityScore: 3,
          businessImpact: "",
          status: "Active",
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
          Aktiv nomi
          <input
            required
            className={inputClass}
            value={form.assetName}
            onChange={(event) => setForm({ ...form, assetName: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Aktiv turi
          <select
            className={inputClass}
            value={form.assetType}
            onChange={(event) => setForm({ ...form, assetType: event.target.value })}
          >
            {assetTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tashkilot
          <input
            required
            className={inputClass}
            value={form.organization}
            onChange={(event) => setForm({ ...form, organization: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Egasi
          <input
            required
            className={inputClass}
            value={form.owner}
            onChange={(event) => setForm({ ...form, owner: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Criticality
          <select
            className={inputClass}
            value={form.criticality}
            onChange={(event) => setForm({ ...form, criticality: event.target.value as Asset["criticality"] })}
          >
            {criticalities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            className={inputClass}
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as Asset["status"] })}
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Confidentiality
          <input
            type="number"
            min={1}
            max={5}
            className={inputClass}
            value={form.confidentialityScore}
            onChange={(event) => setForm({ ...form, confidentialityScore: Number(event.target.value) })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Integrity
          <input
            type="number"
            min={1}
            max={5}
            className={inputClass}
            value={form.integrityScore}
            onChange={(event) => setForm({ ...form, integrityScore: Number(event.target.value) })}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Availability
          <input
            type="number"
            min={1}
            max={5}
            className={inputClass}
            value={form.availabilityScore}
            onChange={(event) => setForm({ ...form, availabilityScore: Number(event.target.value) })}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Biznes ta'siri
        <textarea
          rows={4}
          className={inputClass}
          value={form.businessImpact}
          onChange={(event) => setForm({ ...form, businessImpact: event.target.value })}
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
