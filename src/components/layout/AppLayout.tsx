import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { canAccessRoute } from "../../lib/auth";
import { usePlatform } from "../../lib/platform-context";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import { ErrorState } from "../ui/ErrorState";

export function AppLayout() {
  const { currentUser } = usePlatform();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const allowed = canAccessRoute(currentUser.role, location.pathname);

  return (
    <div className="flex min-h-screen bg-transparent">
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar collapsed={false} onToggle={() => setCollapsed((value) => !value)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8">
          {allowed ? (
            <Outlet />
          ) : (
            <ErrorState
              title="Ushbu bo'lim sizning rolingiz uchun yopiq"
              description="Rolga asoslangan kirish nazorati ishlamoqda. Dashboard yoki sizga ruxsat berilgan bo'limga qayting."
              retryLabel="Dashboard ga qaytish"
              onRetry={() => navigate("/dashboard")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
