import { useMemo, useState } from "react";
import { DataTable } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { usePlatform } from "../../lib/platform-context";
import { formatDateTime } from "../../lib/utils";

export function AuditLogsPage() {
  const { auditLogs, globalSearch } = usePlatform();
  const [statusFilter, setStatusFilter] = useState("Barchasi");

  const filtered = useMemo(
    () =>
      auditLogs.filter((log) => {
        const matchesSearch = `${log.action} ${log.userName} ${log.entityType}`
          .toLowerCase()
          .includes(globalSearch.toLowerCase());
        const matchesStatus = statusFilter === "Barchasi" || log.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [auditLogs, globalSearch, statusFilter],
  );

  return (
    <div className="space-y-6">
      <DataTable
        title="Audit log jadvali"
        description="Login, CRUD, risk assessment va settings amallarining audit izi"
        data={filtered}
        emptyTitle="Audit log topilmadi"
        emptyDescription="Hozircha mos yozuv mavjud emas."
        toolbar={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <option>Barchasi</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
        }
        columns={[
          { key: "date", header: "Sana", render: (log) => formatDateTime(log.createdAt) },
          { key: "user", header: "Foydalanuvchi", render: (log) => log.userName },
          { key: "action", header: "Amal", render: (log) => log.action },
          { key: "entity", header: "Modul", render: (log) => log.entityType },
          { key: "ip", header: "IP", render: (log) => log.ipAddress },
          {
            key: "status",
            header: "Status",
            render: (log) => <Badge variant={log.status === "Success" ? "green" : "red"}>{log.status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
