import {
  Activity,
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Radar,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { canAccessRoute } from "../../lib/auth";
import { cn } from "../../lib/utils";
import { usePlatform } from "../../lib/platform-context";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Aktivlar", icon: Shield },
  { to: "/threats", label: "Tahdidlar", icon: ShieldAlert },
  { to: "/vulnerabilities", label: "Zaifliklar", icon: Radar },
  { to: "/controls", label: "Nazorat choralari", icon: ShieldCheck },
  { to: "/risk-assessment", label: "Risk baholash", icon: Activity },
  { to: "/risk-matrix", label: "Risk matritsa", icon: BarChart3 },
  { to: "/heatmap", label: "Risk heatmap", icon: BarChart3 },
  { to: "/recommendations", label: "Tavsiyalar", icon: ShieldCheck },
  { to: "/reports", label: "Hisobotlar", icon: FileText },
  { to: "/audit-logs", label: "Audit log", icon: Activity },
  { to: "/users", label: "Foydalanuvchilar", icon: Users },
  { to: "/settings", label: "Sozlamalar", icon: Settings },
];

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { currentUser, logout } = usePlatform();
  const visibleItems = items.filter((item) => (currentUser ? canAccessRoute(currentUser.role, item.to) : false));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-800/40 bg-[var(--sidebar)] text-white transition-all duration-300",
        collapsed ? "w-[96px]" : "w-[280px]",
      )}
    >
      <div className="border-b border-white/10 px-5 py-6">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-2xl bg-white/5 px-3 py-3 text-left transition hover:bg-white/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-extrabold text-slate-950">
            CR
          </div>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">CyberRisk</p>
              <p className="mt-1 text-sm text-slate-300">Probability Platform</p>
            </div>
          ) : null}
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white",
                  isActive && "bg-gradient-to-r from-blue-600/60 to-cyan-500/30 text-white shadow-lg shadow-cyan-950/20",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        {!collapsed && currentUser ? (
          <div className="mb-4 rounded-2xl bg-white/6 p-3">
            <p className="text-sm font-semibold">{currentUser.fullName}</p>
            <p className="mt-1 text-xs text-slate-400">{currentUser.role}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/14",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed ? <span>Chiqish</span> : null}
        </button>
      </div>
    </aside>
  );
}
