import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SecurityControl } from "../../types";
import { DataTable } from "../ui/DataTable";
import { Badge } from "../ui/Badge";

export function ControlTable({
  controls,
  toolbar,
  onEdit,
  onDelete,
}: {
  controls: SecurityControl[];
  toolbar?: ReactNode;
  onEdit: (item: SecurityControl) => void;
  onDelete: (item: SecurityControl) => void;
}) {
  return (
    <DataTable
      title="Nazorat choralari"
      description="Framework va control weakness bo'yicha boshqaruv choralari"
      toolbar={toolbar}
      data={controls}
      emptyTitle="Nazorat topilmadi"
      emptyDescription="Yangi nazorat qo'shish yoki filterlarni yangilang."
      columns={[
        {
          key: "name",
          header: "Nazorat",
          render: (item) => (
            <div>
              <p className="font-semibold text-slate-900">{item.controlName}</p>
              <p className="mt-1 text-xs text-slate-500">{item.controlType}</p>
            </div>
          ),
        },
        {
          key: "framework",
          header: "Framework",
          render: (item) => item.framework,
        },
        {
          key: "weakness",
          header: "Weakness",
          render: (item) => <Badge variant="yellow">{item.effectivenessScore.toFixed(2)}</Badge>,
        },
        {
          key: "status",
          header: "Status",
          render: (item) => <Badge variant="blue">{item.implementationStatus}</Badge>,
        },
        {
          key: "owner",
          header: "Owner",
          render: (item) => item.owner,
        },
        {
          key: "actions",
          header: "Actions",
          render: (item) => (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onEdit(item)} className="rounded-xl border border-slate-200 p-2">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
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
