import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Threat } from "../../types";
import { DataTable } from "../ui/DataTable";
import { RiskLevelBadge } from "../risk/RiskLevelBadge";
import { Badge } from "../ui/Badge";

export function ThreatTable({
  threats,
  toolbar,
  onEdit,
  onDelete,
}: {
  threats: Threat[];
  toolbar?: ReactNode;
  onEdit: (threat: Threat) => void;
  onDelete: (threat: Threat) => void;
}) {
  return (
    <DataTable
      title="Tahdidlar katalogi"
      description="Ehtimollik va manba bo'yicha tahdid reyestri"
      toolbar={toolbar}
      data={threats}
      emptyTitle="Tahdid topilmadi"
      emptyDescription="Qidiruvni o'zgartiring yoki yangi tahdid qo'shing."
      columns={[
        {
          key: "name",
          header: "Tahdid",
          render: (threat) => (
            <div>
              <p className="font-semibold text-slate-900">{threat.threatName}</p>
              <p className="mt-1 text-xs text-slate-500">{threat.description}</p>
            </div>
          ),
        },
        {
          key: "category",
          header: "Kategoriya",
          render: (threat) => threat.category,
        },
        {
          key: "probability",
          header: "Probability",
          render: (threat) => <Badge variant="teal">{threat.probability}</Badge>,
        },
        {
          key: "source",
          header: "Manba",
          render: (threat) => threat.source,
        },
        {
          key: "severity",
          header: "Severity",
          render: (threat) => <RiskLevelBadge level={threat.severity} />,
        },
        {
          key: "actions",
          header: "Actions",
          render: (threat) => (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onEdit(threat)} className="rounded-xl border border-slate-200 p-2">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(threat)}
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
