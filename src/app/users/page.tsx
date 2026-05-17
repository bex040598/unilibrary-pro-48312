import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2, UserPen } from "lucide-react";
import { DataTable } from "../../components/ui/DataTable";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { usePlatform } from "../../lib/platform-context";
import { AppUser } from "../../types";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none";

function UserForm({
  initialValue,
  onSubmit,
}: {
  initialValue?: AppUser | null;
  onSubmit: (value: Omit<AppUser, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<AppUser, "id" | "createdAt">>(
    initialValue
      ? {
          fullName: initialValue.fullName,
          email: initialValue.email,
          role: initialValue.role,
          organization: initialValue.organization,
          status: initialValue.status,
          password: initialValue.password,
        }
      : {
          fullName: "",
          email: "",
          role: "Tashkilot foydalanuvchisi",
          organization: "Digital University",
          status: "Active",
          password: "User123!",
        },
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          F.I.Sh.
          <input className={inputClass} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Email
          <input className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Role
          <select className={inputClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AppUser["role"] })}>
            <option>Super Admin</option>
            <option>Kiberxavfsizlik Analitigi</option>
            <option>Auditor</option>
            <option>Tashkilot foydalanuvchisi</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tashkilot
          <input className={inputClass} value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AppUser["status"] })}>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Demo parol
          <input className={inputClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
      </div>
      <div className="flex justify-end">
        <button className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">Saqlash</button>
      </div>
    </form>
  );
}

export function UsersPage() {
  const { users, addUser, updateUser, deleteUser, globalSearch } = usePlatform();
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const filtered = useMemo(
    () => users.filter((user) => `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(globalSearch.toLowerCase())),
    [globalSearch, users],
  );

  return (
    <div className="space-y-6">
      <DataTable
        title="Foydalanuvchilar boshqaruvi"
        description="RBAC ga tayyor demo foydalanuvchilar ro'yxati"
        data={filtered}
        emptyTitle="Foydalanuvchi topilmadi"
        emptyDescription="Qidiruvni o'zgartiring yoki yangi foydalanuvchi qo'shing."
        toolbar={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add user
            </span>
          </button>
        }
        columns={[
          { key: "name", header: "Foydalanuvchi", render: (user) => user.fullName },
          { key: "email", header: "Email", render: (user) => user.email },
          { key: "role", header: "Role", render: (user) => <Badge variant="blue">{user.role}</Badge> },
          { key: "org", header: "Tashkilot", render: (user) => user.organization },
          { key: "status", header: "Status", render: (user) => <Badge variant={user.status === "Active" ? "green" : "red"}>{user.status}</Badge> },
          {
            key: "actions",
            header: "Actions",
            render: (user) => (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditing(user)} className="rounded-xl border border-slate-200 p-2">
                  <UserPen className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${user.fullName} ni o'chirishni tasdiqlaysizmi?`)) {
                      deleteUser(user.id);
                    }
                  }}
                  className="rounded-xl border border-rose-200 p-2 text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yangi foydalanuvchi">
        <UserForm
          onSubmit={(value) => {
            addUser(value);
            setOpenCreate(false);
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Foydalanuvchini tahrirlash">
        <UserForm
          initialValue={editing}
          onSubmit={(value) => {
            if (editing) {
              updateUser(editing.id, value);
              setEditing(null);
            }
          }}
        />
      </Modal>
    </div>
  );
}
