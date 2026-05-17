import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ControlForm } from "../../components/controls/ControlForm";
import { ControlTable } from "../../components/controls/ControlTable";
import { Modal } from "../../components/ui/Modal";
import { usePlatform } from "../../lib/platform-context";
import { SecurityControl } from "../../types";

export function ControlsPage() {
  const { controls, addControl, updateControl, deleteControl, globalSearch } = usePlatform();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SecurityControl | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(
    () =>
      controls.filter((item) =>
        `${item.controlName} ${item.framework} ${item.controlType} ${item.description}`
          .toLowerCase()
          .includes((query || globalSearch).toLowerCase()),
      ),
    [controls, globalSearch, query],
  );

  return (
    <div className="space-y-6">
      <ControlTable
        controls={filtered}
        onEdit={(item) => setEditing(item)}
        onDelete={(item) => {
          if (window.confirm(`${item.controlName} ni o'chirishni tasdiqlaysizmi?`)) {
            deleteControl(item.id);
          }
        }}
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nazorat qidirish..." className="bg-transparent text-sm outline-none" />
            </div>
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add control
              </span>
            </button>
          </div>
        }
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yangi nazorat chorasi">
        <ControlForm
          onSubmit={(value) => {
            addControl(value);
            setOpenCreate(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Nazorat chorasini tahrirlash">
        <ControlForm
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              updateControl(editing.id, value);
              setEditing(null);
            }
          }}
        />
      </Modal>
    </div>
  );
}
