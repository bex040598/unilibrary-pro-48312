import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AssetForm } from "../../components/assets/AssetForm";
import { AssetDetail } from "../../components/assets/AssetDetail";
import { AssetTable } from "../../components/assets/AssetTable";
import { Modal } from "../../components/ui/Modal";
import { usePlatform } from "../../lib/platform-context";
import { Asset } from "../../types";

export function AssetsPage() {
  const { assets, addAsset, updateAsset, deleteAsset, globalSearch } = usePlatform();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Barchasi");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(
    () =>
      assets.filter((asset) => {
        const search = `${asset.assetName} ${asset.assetType} ${asset.organization} ${asset.owner}`.toLowerCase();
        const matchesSearch = search.includes((query || globalSearch).toLowerCase());
        const matchesStatus = statusFilter === "Barchasi" || asset.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [assets, globalSearch, query, statusFilter],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Jami aktivlar</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">{assets.length}</p>
        </div>
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Kritik aktivlar</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {assets.filter((item) => item.criticality === "Kritik").length}
          </p>
        </div>
        <div className="panel rounded-3xl p-5">
          <p className="text-sm text-slate-500">Under review</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {assets.filter((item) => item.status === "Under Review").length}
          </p>
        </div>
      </div>

      <AssetTable
        assets={filtered}
        onView={(asset) => setSelected(asset)}
        onEdit={(asset) => setEditing(asset)}
        onDelete={(asset) => {
          if (window.confirm(`${asset.assetName} ni o'chirishni tasdiqlaysizmi?`)) {
            deleteAsset(asset.id);
          }
        }}
        toolbar={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Aktiv qidirish..."
                className="bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option>Barchasi</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Under Review</option>
            </select>
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add asset
              </span>
            </button>
          </div>
        }
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yangi aktiv qo'shish">
        <AssetForm
          onSubmit={(value) => {
            addAsset(value);
            setOpenCreate(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Aktivni tahrirlash">
        <AssetForm
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              updateAsset(editing.id, value);
              setEditing(null);
            }
          }}
        />
      </Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Aktiv tafsiloti">
        {selected ? <AssetDetail asset={selected} /> : null}
      </Modal>
    </div>
  );
}
