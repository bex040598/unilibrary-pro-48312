import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ThreatForm } from "../../components/threats/ThreatForm";
import { ThreatTable } from "../../components/threats/ThreatTable";
import { Modal } from "../../components/ui/Modal";
import { usePlatform } from "../../lib/platform-context";
import { Threat } from "../../types";

export function ThreatsPage() {
  const { threats, addThreat, updateThreat, deleteThreat, globalSearch } = usePlatform();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Threat | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(
    () =>
      threats.filter((threat) =>
        `${threat.threatName} ${threat.category} ${threat.description}`
          .toLowerCase()
          .includes((query || globalSearch).toLowerCase()),
      ),
    [globalSearch, query, threats],
  );

  return (
    <div className="space-y-6">
      <ThreatTable
        threats={filtered}
        onEdit={(threat) => setEditing(threat)}
        onDelete={(threat) => {
          if (window.confirm(`${threat.threatName} ni o'chirishni tasdiqlaysizmi?`)) {
            deleteThreat(threat.id);
          }
        }}
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tahdid qidirish..."
                className="bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add threat
              </span>
            </button>
          </div>
        }
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yangi tahdid qo'shish">
        <ThreatForm
          onSubmit={(value) => {
            addThreat(value);
            setOpenCreate(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Tahdidni tahrirlash">
        <ThreatForm
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              updateThreat(editing.id, value);
              setEditing(null);
            }
          }}
        />
      </Modal>
    </div>
  );
}
