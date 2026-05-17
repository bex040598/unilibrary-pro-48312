import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { usePlatform } from "../../lib/platform-context";
import { ErrorState } from "../../components/ui/ErrorState";

const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--blue)]";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, users } = usePlatform();
  const [email, setEmail] = useState("admin@cyberrisk.uz");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message ?? "Kirish amalga oshmadi.");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-[var(--sidebar)] p-10 text-white lg:block">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-extrabold leading-tight">
              Raqamli tizimlarda kiberxavfsizlik risklarini ehtimollik asosida baholash platformasi
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Magistrlik dissertatsiyasi, ilmiy tahlil va amaliy xavfsizlik boshqaruvi uchun mo'ljallangan
              enterprise darajadagi cybersecurity risk management dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <p className="text-sm font-semibold">{user.role}</p>
                <p className="mt-2 text-sm text-cyan-100">{user.email}</p>
                <p className="mt-1 text-xs text-slate-300">Demo parol: {user.password}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="panel rounded-[2rem] p-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Platformaga kirish</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              JWT/RBAC arxitekturaga tayyor frontend MVP. Demo rollar bilan kirib barcha modullarni tekshirib chiqing.
            </p>

            {error ? (
              <div className="mt-5">
                <ErrorState title="Kirish xatosi" description={error} />
              </div>
            ) : null}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Parol
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15446f]"
              >
                Kirish
              </button>
            </form>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-[var(--blue)] hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{user.role}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
