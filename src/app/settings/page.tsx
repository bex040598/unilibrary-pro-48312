import { FormEvent, useState } from "react";
import { usePlatform } from "../../lib/platform-context";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none";

export function SettingsPage() {
  const { settings, updateSettings, resetDemoData } = usePlatform();
  const [form, setForm] = useState(settings);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings(form);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form className="panel rounded-3xl p-6" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-slate-950">Platform settings</h3>
        <p className="mt-1 text-sm text-slate-500">Framework, branding va alert sozlamalari</p>
        <div className="mt-6 grid gap-5">
          <label className="text-sm font-medium text-slate-700">
            Default organization
            <input className={inputClass} value={form.defaultOrganization} onChange={(event) => setForm({ ...form, defaultOrganization: event.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Preferred framework
            <input className={inputClass} value={form.preferredFramework} onChange={(event) => setForm({ ...form, preferredFramework: event.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Report owner
            <input className={inputClass} value={form.reportOwner} onChange={(event) => setForm({ ...form, reportOwner: event.target.value })} />
          </label>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Low max
              <input type="number" className={inputClass} value={form.riskThresholds.lowMax} onChange={(event) => setForm({ ...form, riskThresholds: { ...form.riskThresholds, lowMax: Number(event.target.value) } })} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Medium max
              <input type="number" className={inputClass} value={form.riskThresholds.mediumMax} onChange={(event) => setForm({ ...form, riskThresholds: { ...form.riskThresholds, mediumMax: Number(event.target.value) } })} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              High max
              <input type="number" className={inputClass} value={form.riskThresholds.highMax} onChange={(event) => setForm({ ...form, riskThresholds: { ...form.riskThresholds, highMax: Number(event.target.value) } })} />
            </label>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
            Email alerts
            <input type="checkbox" checked={form.enableEmailAlerts} onChange={(event) => setForm({ ...form, enableEmailAlerts: event.target.checked })} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
            Print branding
            <input type="checkbox" checked={form.enablePrintBranding} onChange={(event) => setForm({ ...form, enablePrintBranding: event.target.checked })} />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">Sozlamalarni saqlash</button>
          <button
            type="button"
            onClick={resetDemoData}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Demo ma'lumotlarni tiklash
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="panel rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-950">Security architecture note</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Backend bosqichida JWT auth, bcrypt hashing, rate limiting, input validation, audit log API va PostgreSQL
            integratsiyasi shu frontend bilan bir xil ma'lumot kontraktlari asosida ulanadi.
          </p>
        </div>
        <div className="panel rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-950">Deployment readiness</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>Docker-ready frontend build: `npm run build`</li>
            <li>Render/Vercel uchun SPA static build tayyor</li>
            <li>REST endpoint katalogi `src/lib/api.ts` da tayyorlangan</li>
            <li>Mock/localStorage state keyinchalik PostgreSQL/Prisma yoki Express API bilan almashtiriladi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
