import { AuditLog } from "../../types";
import { formatDateTime } from "../../lib/utils";
import { Badge } from "../ui/Badge";

export function RecentActivity({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="panel rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Oxirgi audit faoliyati</h3>
        <p className="mt-1 text-sm text-slate-500">Platformadagi kuzatilgan amallar</p>
      </div>
      <div className="space-y-3">
        {logs.slice(0, 6).map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{log.action}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.userName} | {formatDateTime(log.createdAt)}
                </p>
              </div>
              <Badge variant={log.status === "Success" ? "green" : "red"}>{log.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
