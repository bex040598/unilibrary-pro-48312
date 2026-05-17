import { UserRole } from "../types";

const SESSION_KEY = "cyberrisk-session-v2";

export interface SessionRecord {
  userId: string;
  token: string;
  expiresAt: string;
}

const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": [
    "Super Admin",
    "Kiberxavfsizlik Analitigi",
    "Auditor",
    "Tashkilot foydalanuvchisi",
  ],
  "/assets": ["Super Admin", "Kiberxavfsizlik Analitigi", "Tashkilot foydalanuvchisi"],
  "/threats": ["Super Admin", "Kiberxavfsizlik Analitigi"],
  "/vulnerabilities": ["Super Admin", "Kiberxavfsizlik Analitigi"],
  "/controls": ["Super Admin", "Kiberxavfsizlik Analitigi"],
  "/risk-assessment": ["Super Admin", "Kiberxavfsizlik Analitigi"],
  "/risk-matrix": [
    "Super Admin",
    "Kiberxavfsizlik Analitigi",
    "Auditor",
    "Tashkilot foydalanuvchisi",
  ],
  "/heatmap": [
    "Super Admin",
    "Kiberxavfsizlik Analitigi",
    "Auditor",
    "Tashkilot foydalanuvchisi",
  ],
  "/recommendations": [
    "Super Admin",
    "Kiberxavfsizlik Analitigi",
    "Auditor",
    "Tashkilot foydalanuvchisi",
  ],
  "/reports": [
    "Super Admin",
    "Kiberxavfsizlik Analitigi",
    "Auditor",
    "Tashkilot foydalanuvchisi",
  ],
  "/audit-logs": ["Super Admin", "Auditor"],
  "/users": ["Super Admin"],
  "/settings": ["Super Admin"],
};

export function createSession(userId: string): SessionRecord {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
  return {
    userId,
    token: `demo-${userId}-${Date.now()}`,
    expiresAt,
  };
}

export function getSession() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionRecord;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }

    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(session: SessionRecord) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function canAccessRoute(role: UserRole, pathname: string) {
  const target =
    Object.keys(routePermissions).find((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    "/dashboard";

  return routePermissions[target]?.includes(role) ?? false;
}
