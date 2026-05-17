import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { VulnerabilityForm } from "../../components/vulnerabilities/VulnerabilityForm";
import { VulnerabilityTable } from "../../components/vulnerabilities/VulnerabilityTable";
import { Modal } from "../../components/ui/Modal";
import { usePlatform } from "../../lib/platform-context";
import { Vulnerability } from "../../types";

export function VulnerabilitiesPage() {
  const { vulnerabilities, assets, addVulnerability, updateVulnerability, deleteVulnerability, globalSearch } = usePlatform();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Vulnerability | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(
    () =>
      vulnerabilities.filter((item) =>
        `${item.vulnerabilityName} ${item.category} ${item.description}`.toLowerCase().includes((query || globalSearch).toLowerCase()),
      ),
    [globalSearch, query, vulnerabilities],
  );

  return (
    <div className="space-y-6">
      <VulnerabilityTable
        vulnerabilities={filtered}
        assets={assets}
        onEdit={(item) => setEditing(item)}
        onDelete={(item) => {
          if (window.confirm(`${item.vulnerabilityName} ni o'chirishni tasdiqlaysizmi?`)) {
            deleteVulnerability(item.id);
          }
        }}
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Zaiflik qidirish..."
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
                Add vulnerability
              </span>
            </button>
          </div>
        }
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yangi zaiflik qo'shish">
        <VulnerabilityForm
          assets={assets}
          onSubmit={(value) => {
            addVulnerability(value);
            setOpenCreate(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Zaiflikni tahrirlash">
        <VulnerabilityForm
          assets={assets}
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              updateVulnerability(editing.id, value);
              setEditing(null);
            }
          }}
        />
      </Modal>
    </div>
  );
}
