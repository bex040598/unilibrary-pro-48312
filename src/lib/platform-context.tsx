import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import {
  AppUser,
  Asset,
  AuditLog,
  PlatformSettings,
  ReportRecord,
  RiskAssessment,
  SecurityControl,
  Threat,
  Vulnerability,
} from "../types";
import { createSession, clearSession, getSession, setSession } from "./auth";
import { createSeedState } from "./mockData";
import { calculateRisk } from "./riskCalculator";
import { generateRecommendation } from "./recommendationEngine";
import { getAssetImpactValue, uid } from "./utils";

const STORAGE_KEY = "cyberrisk-platform-state-v2";

type Store = ReturnType<typeof createSeedState>;

interface CreateRiskAssessmentInput {
  assetId: string;
  threatId: string;
  vulnerabilityId: string;
  controlId: string;
}

interface ReportInput {
  organization: string;
  fromDate: string;
  toDate: string;
  riskLevel: ReportRecord["riskLevel"];
  format: ReportRecord["format"];
}

interface PlatformContextValue extends Store {
  loading: boolean;
  error: string | null;
  currentUser: AppUser | null;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addAsset: (asset: Omit<Asset, "id" | "createdAt">) => void;
  updateAsset: (id: string, asset: Omit<Asset, "id" | "createdAt">) => void;
  deleteAsset: (id: string) => void;
  addThreat: (threat: Omit<Threat, "id" | "createdAt">) => void;
  updateThreat: (id: string, threat: Omit<Threat, "id" | "createdAt">) => void;
  deleteThreat: (id: string) => void;
  addVulnerability: (vulnerability: Omit<Vulnerability, "id" | "createdAt">) => void;
  updateVulnerability: (id: string, vulnerability: Omit<Vulnerability, "id" | "createdAt">) => void;
  deleteVulnerability: (id: string) => void;
  addControl: (control: Omit<SecurityControl, "id" | "createdAt">) => void;
  updateControl: (id: string, control: Omit<SecurityControl, "id" | "createdAt">) => void;
  deleteControl: (id: string) => void;
  createRiskAssessment: (input: CreateRiskAssessmentInput) => RiskAssessment | null;
  deleteRiskAssessment: (id: string) => void;
  addUser: (user: Omit<AppUser, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Omit<AppUser, "id" | "createdAt">) => void;
  deleteUser: (id: string) => void;
  generateReport: (input: ReportInput) => ReportRecord;
  updateSettings: (settings: PlatformSettings) => void;
  resetDemoData: () => void;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

function readStore(): Store {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createSeedState();
  }

  try {
    return JSON.parse(raw) as Store;
  } catch {
    return createSeedState();
  }
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<Store>(createSeedState());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    try {
      const nextStore = readStore();
      setStore(nextStore);
      const session = getSession();
      if (session) {
        const user = nextStore.users.find((item) => item.id === session.userId) ?? null;
        setCurrentUser(user);
      }
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      window.setTimeout(() => setLoading(false), 350);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [loading, store]);

  function appendAudit(action: string, entityType: string, entityId: string, status: AuditLog["status"] = "Success") {
    const actor = currentUser ?? store.users[0];
    const entry: AuditLog = {
      id: uid("audit"),
      userId: actor?.id ?? "system",
      userName: actor?.fullName ?? "System",
      action,
      entityType,
      entityId,
      ipAddress: "127.0.0.1",
      status,
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      auditLogs: [entry, ...prev.auditLogs],
    }));
  }

  async function login(email: string, password: string) {
    const user = store.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      appendAudit("Login urinishi muvaffaqiyatsiz", "Auth", email, "Failed");
      return { success: false, message: "Email yoki parol noto'g'ri." };
    }

    const session = createSession(user.id);
    setSession(session);
    setCurrentUser(user);
    appendAudit("Login", "Auth", user.id);
    return { success: true };
  }

  function logout() {
    if (currentUser) {
      appendAudit("Logout", "Auth", currentUser.id);
    }
    clearSession();
    setCurrentUser(null);
  }

  function addAsset(asset: Omit<Asset, "id" | "createdAt">) {
    const next: Asset = { ...asset, id: uid("asset"), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, assets: [next, ...prev.assets] }));
    appendAudit("Aktiv qo'shildi", "Asset", next.id);
  }

  function updateAsset(id: string, asset: Omit<Asset, "id" | "createdAt">) {
    setStore((prev) => ({
      ...prev,
      assets: prev.assets.map((item) => (item.id === id ? { ...item, ...asset } : item)),
    }));
    appendAudit("Aktiv o'zgartirildi", "Asset", id);
  }

  function deleteAsset(id: string) {
    setStore((prev) => ({
      ...prev,
      assets: prev.assets.filter((item) => item.id !== id),
      vulnerabilities: prev.vulnerabilities.filter((item) => item.affectedAsset !== id),
      riskAssessments: prev.riskAssessments.filter((item) => item.assetId !== id),
    }));
    appendAudit("Aktiv o'chirildi", "Asset", id);
  }

  function addThreat(threat: Omit<Threat, "id" | "createdAt">) {
    const next: Threat = { ...threat, id: uid("threat"), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, threats: [next, ...prev.threats] }));
    appendAudit("Tahdid qo'shildi", "Threat", next.id);
  }

  function updateThreat(id: string, threat: Omit<Threat, "id" | "createdAt">) {
    setStore((prev) => ({
      ...prev,
      threats: prev.threats.map((item) => (item.id === id ? { ...item, ...threat } : item)),
    }));
    appendAudit("Tahdid o'zgartirildi", "Threat", id);
  }

  function deleteThreat(id: string) {
    setStore((prev) => ({
      ...prev,
      threats: prev.threats.filter((item) => item.id !== id),
      riskAssessments: prev.riskAssessments.filter((item) => item.threatId !== id),
    }));
    appendAudit("Tahdid o'chirildi", "Threat", id);
  }

  function addVulnerability(vulnerability: Omit<Vulnerability, "id" | "createdAt">) {
    const next: Vulnerability = {
      ...vulnerability,
      id: uid("vulnerability"),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, vulnerabilities: [next, ...prev.vulnerabilities] }));
    appendAudit("Zaiflik qo'shildi", "Vulnerability", next.id);
  }

  function updateVulnerability(id: string, vulnerability: Omit<Vulnerability, "id" | "createdAt">) {
    setStore((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.map((item) => (item.id === id ? { ...item, ...vulnerability } : item)),
    }));
    appendAudit("Zaiflik o'zgartirildi", "Vulnerability", id);
  }

  function deleteVulnerability(id: string) {
    setStore((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.filter((item) => item.id !== id),
      riskAssessments: prev.riskAssessments.filter((item) => item.vulnerabilityId !== id),
    }));
    appendAudit("Zaiflik o'chirildi", "Vulnerability", id);
  }

  function addControl(control: Omit<SecurityControl, "id" | "createdAt">) {
    const next: SecurityControl = {
      ...control,
      id: uid("control"),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, controls: [next, ...prev.controls] }));
    appendAudit("Nazorat chorasi qo'shildi", "Control", next.id);
  }

  function updateControl(id: string, control: Omit<SecurityControl, "id" | "createdAt">) {
    setStore((prev) => ({
      ...prev,
      controls: prev.controls.map((item) => (item.id === id ? { ...item, ...control } : item)),
    }));
    appendAudit("Nazorat chorasi o'zgartirildi", "Control", id);
  }

  function deleteControl(id: string) {
    setStore((prev) => ({
      ...prev,
      controls: prev.controls.filter((item) => item.id !== id),
      riskAssessments: prev.riskAssessments.filter((item) => item.controlId !== id),
    }));
    appendAudit("Nazorat chorasi o'chirildi", "Control", id);
  }

  function createRiskAssessment(input: CreateRiskAssessmentInput) {
    const asset = store.assets.find((item) => item.id === input.assetId);
    const threat = store.threats.find((item) => item.id === input.threatId);
    const vulnerability = store.vulnerabilities.find((item) => item.id === input.vulnerabilityId);
    const control = store.controls.find((item) => item.id === input.controlId);

    if (!asset || !threat || !vulnerability || !control || !currentUser) {
      return null;
    }

    const impactValue = getAssetImpactValue(asset);
    const result = calculateRisk({
      threatProbability: threat.probability,
      vulnerabilityLevel: vulnerability.severityScore,
      impactValue,
      controlWeakness: control.effectivenessScore,
    });

    const next: RiskAssessment = {
      id: uid("risk"),
      assetId: asset.id,
      threatId: threat.id,
      vulnerabilityId: vulnerability.id,
      controlId: control.id,
      threatProbability: threat.probability,
      vulnerabilityLevel: vulnerability.severityScore,
      impactValue,
      controlWeakness: control.effectivenessScore,
      riskScore: result.score,
      riskLevel: result.level,
      recommendations: generateRecommendation(result.level, threat.category),
      assessedBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({
      ...prev,
      riskAssessments: [next, ...prev.riskAssessments],
    }));
    appendAudit("Risk baholandi", "RiskAssessment", next.id);
    return next;
  }

  function deleteRiskAssessment(id: string) {
    setStore((prev) => ({
      ...prev,
      riskAssessments: prev.riskAssessments.filter((item) => item.id !== id),
    }));
    appendAudit("Risk baholash o'chirildi", "RiskAssessment", id);
  }

  function addUser(user: Omit<AppUser, "id" | "createdAt">) {
    const next: AppUser = { ...user, id: uid("user"), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, users: [next, ...prev.users] }));
    appendAudit("Foydalanuvchi qo'shildi", "User", next.id);
  }

  function updateUser(id: string, user: Omit<AppUser, "id" | "createdAt">) {
    setStore((prev) => ({
      ...prev,
      users: prev.users.map((item) => (item.id === id ? { ...item, ...user } : item)),
    }));
    appendAudit("Foydalanuvchi o'zgartirildi", "User", id);
  }

  function deleteUser(id: string) {
    setStore((prev) => ({
      ...prev,
      users: prev.users.filter((item) => item.id !== id),
    }));
    appendAudit("Foydalanuvchi o'chirildi", "User", id);
  }

  function generateReport(input: ReportInput) {
    const filtered = store.riskAssessments.filter((item) => {
      const createdTime = new Date(item.createdAt).getTime();
      const fromTime = new Date(input.fromDate).getTime();
      const toTime = new Date(input.toDate).getTime();
      const matchesDate = createdTime >= fromTime && createdTime <= toTime;
      const asset = store.assets.find((entry) => entry.id === item.assetId);
      const matchesOrg = !input.organization || asset?.organization === input.organization;
      const matchesRisk = input.riskLevel === "Barchasi" || item.riskLevel === input.riskLevel;
      return matchesDate && matchesOrg && matchesRisk;
    });

    const report: ReportRecord = {
      id: uid("report"),
      organization: input.organization,
      fromDate: input.fromDate,
      toDate: input.toDate,
      riskLevel: input.riskLevel,
      format: input.format,
      generatedBy: currentUser?.fullName ?? "Unknown",
      createdAt: new Date().toISOString(),
      itemCount: filtered.length,
      summary: `${filtered.length} ta baholash asosida hisobot shakllantirildi.`,
    };

    setStore((prev) => ({
      ...prev,
      reports: [report, ...prev.reports],
    }));
    appendAudit("Hisobot yaratildi", "Report", report.id);
    return report;
  }

  function updateSettings(settings: PlatformSettings) {
    setStore((prev) => ({ ...prev, settings }));
    appendAudit("Sozlamalar yangilandi", "Settings", "platform-settings");
  }

  function resetDemoData() {
    const seed = createSeedState();
    setStore(seed);
    if (currentUser) {
      const sameUser = seed.users.find((item) => item.email === currentUser.email) ?? null;
      setCurrentUser(sameUser);
      if (sameUser) {
        setSession(createSession(sameUser.id));
      }
    }
    appendAudit("Demo ma'lumotlar qayta tiklandi", "System", "seed-reset");
  }

  return (
    <PlatformContext.Provider
      value={{
        ...store,
        loading,
        error,
        currentUser,
        globalSearch,
        setGlobalSearch,
        login,
        logout,
        addAsset,
        updateAsset,
        deleteAsset,
        addThreat,
        updateThreat,
        deleteThreat,
        addVulnerability,
        updateVulnerability,
        deleteVulnerability,
        addControl,
        updateControl,
        deleteControl,
        createRiskAssessment,
        deleteRiskAssessment,
        addUser,
        updateUser,
        deleteUser,
        generateReport,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformProvider");
  }

  return context;
}
