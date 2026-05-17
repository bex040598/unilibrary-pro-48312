import { Bell, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { usePlatform } from "../../lib/platform-context";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "CyberRisk Probability Assessment Platform",
    subtitle: "KPI, trend va kritik risklarni boshqarish markazi",
  },
  "/assets": { title: "Aktivlar", subtitle: "Raqamli aktivlar inventari va CIA baholash" },
  "/threats": { title: "Tahdidlar", subtitle: "Tahdid katalogi va ehtimollik profili" },
  "/vulnerabilities": { title: "Zaifliklar", subtitle: "Aktivlarga bog'langan zaifliklar reyestri" },
  "/controls": { title: "Nazorat choralari", subtitle: "Xavfsizlik nazoratlari va ularning zaifligi" },
  "/risk-assessment": { title: "Risk baholash", subtitle: "P(T) x V x I x C asosida real-time hisoblash" },
  "/risk-matrix": { title: "Risk matritsa", subtitle: "5x5 ehtimollik va ta'sir matritsasi" },
  "/heatmap": { title: "Risk heatmap", subtitle: "Probability va impact bo'yicha issiqlik xaritasi" },
  "/recommendations": { title: "Tavsiyalar", subtitle: "Riskka mos mitigatsiya va javob chorasi" },
  "/reports": { title: "Hisobotlar", subtitle: "Preview, eksport va boshqaruv xulosalari" },
  "/audit-logs": { title: "Audit log", subtitle: "Platformadagi barcha nazoratli amallar" },
  "/users": { title: "Foydalanuvchilar", subtitle: "Rolga asoslangan kirish nazorati" },
  "/settings": { title: "Sozlamalar", subtitle: "Framework, branding va risk threshold sozlamalari" },
};

export function Header({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, globalSearch, setGlobalSearch, riskAssessments } = usePlatform();
  const meta = pageTitles[location.pathname] ?? pageTitles["/dashboard"];
  const criticalCount = riskAssessments.filter((item) => item.riskLevel === "Kritik").length;

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-5 py-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onMenu}
          className="mt-1 rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Global qidiruv..."
            className="w-full min-w-[220px] bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/audit-logs")}
          className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
        >
          <Bell className="h-5 w-5" />
          {criticalCount > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {criticalCount}
            </span>
          ) : null}
        </button>

        {currentUser ? (
          <div className="panel rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-sm font-bold text-white">
                {currentUser.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="blue">{currentUser.role}</Badge>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
