import { ReactNode } from "react";

export function KpiCard({
  title,
  value,
  icon,
  accent,
  description,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accent: string;
  description: string;
}) {
  return (
    <div className="panel panel-accent rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className={`rounded-2xl p-3 text-white shadow-lg ${accent}`}>{icon}</div>
      </div>
    </div>
  );
}
