import { ReactNode } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Asset } from "../../types";
import { DataTable } from "../ui/DataTable";
import { RiskLevelBadge } from "../risk/RiskLevelBadge";
import { Badge } from "../ui/Badge";
import { getAssetImpactAverage } from "../../lib/utils";

export function AssetTable({
  assets,
  toolbar,
  onView,
  onEdit,
  onDelete,
}: {
  assets: Asset[];
  toolbar?: ReactNode;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}) {
  return (
    <DataTable
      title="Aktivlar reyestri"
      description="CIA va biznes ta'siri bo'yicha ustuvor aktivlar"
      toolbar={toolbar}
      data={assets}
      emptyTitle="Aktiv topilmadi"
      emptyDescription="Filter yoki qidiruvni o'zgartiring, yoki yangi aktiv qo'shing."
      columns={[
        {
          key: "name",
          header: "Aktiv",
          render: (asset) => (
            <div>
              <p className="font-semibold text-slate-900">{asset.assetName}</p>
              <p className="mt-1 text-xs text-slate-500">{asset.assetType}</p>
            </div>
          ),
        },
        {
          key: "organization",
          header: "Tashkilot",
          render: (asset) => asset.organization,
        },
        {
          key: "owner",
          header: "Egasi",
          render: (asset) => asset.owner,
        },
        {
          key: "criticality",
          header: "Criticality",
          render: (asset) => <RiskLevelBadge level={asset.criticality} />,
        },
        {
          key: "cia",
          header: "CIA",
          render: (asset) => `${asset.confidentialityScore}/${asset.integrityScore}/${asset.availabilityScore}`,
        },
        {
          key: "impact",
          header: "Impact",
          render: (asset) => getAssetImpactAverage(asset).toFixed(2),
        },
        {
          key: "status",
          header: "Status",
          render: (asset) => <Badge variant="blue">{asset.status}</Badge>,
        },
        {
          key: "actions",
          header: "Actions",
          render: (asset) => (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onView(asset)} className="rounded-xl border border-slate-200 p-2">
                <Eye className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onEdit(asset)} className="rounded-xl border border-slate-200 p-2">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(asset)}
                className="rounded-xl border border-rose-200 p-2 text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}
