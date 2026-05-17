import { Asset } from "../../types";
import { getAssetImpactAverage } from "../../lib/utils";
import { RiskLevelBadge } from "../risk/RiskLevelBadge";
import { Badge } from "../ui/Badge";

export function AssetDetail({ asset }: { asset: Asset }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <div className="rounded-3xl bg-slate-50 p-5">
          <h4 className="text-lg font-semibold text-slate-950">{asset.assetName}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{asset.businessImpact}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Turi</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{asset.assetType}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tashkilot</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{asset.organization}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Egasi</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{asset.owner}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
            <div className="mt-2">
              <Badge variant="blue">{asset.status}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-3xl bg-[var(--primary)] p-5 text-white">
          <p className="text-sm text-blue-100">Impact Value</p>
          <p className="mt-2 text-4xl font-extrabold">{getAssetImpactAverage(asset).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criticality</p>
          <div className="mt-2">
            <RiskLevelBadge level={asset.criticality} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">CIA profili</p>
          <div className="mt-3 grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <span>Confidentiality</span>
              <strong>{asset.confidentialityScore}/5</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Integrity</span>
              <strong>{asset.integrityScore}/5</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Availability</span>
              <strong>{asset.availabilityScore}/5</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
