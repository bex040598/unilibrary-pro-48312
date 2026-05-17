const SESSION_KEY = "cyberrisk.session";
const API_BASE_KEY = "cyberrisk.apiBase";

function runtimeBase() {
  return window.CYBERRISK_RUNTIME_CONFIG?.apiBase || "http://127.0.0.1:8000";
}

export function getApiBase() {
  return localStorage.getItem(API_BASE_KEY) || runtimeBase();
}

export function setApiBase(value) {
  localStorage.setItem(API_BASE_KEY, value);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function request(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const payload = await response.json();
      detail = payload.detail || payload.message || detail;
    } catch {
      detail = response.statusText || detail;
    }
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/pdf") || contentType.includes("application/vnd.ms-excel")) {
    return response.blob();
  }
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function downloadProtectedFile(path, fileName) {
  const blob = await request(path, { method: "GET" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  listAssets: () => request("/assets"),
  getAsset: (id) => request(`/assets/${id}`),
  createAsset: (payload) => request("/assets", { method: "POST", body: JSON.stringify(payload) }),
  updateAsset: (id, payload) => request(`/assets/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAsset: (id) => request(`/assets/${id}`, { method: "DELETE" }),

  listThreats: () => request("/threats"),
  getThreat: (id) => request(`/threats/${id}`),
  createThreat: (payload) => request("/threats", { method: "POST", body: JSON.stringify(payload) }),
  updateThreat: (id, payload) => request(`/threats/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteThreat: (id) => request(`/threats/${id}`, { method: "DELETE" }),

  listVulnerabilities: () => request("/vulnerabilities"),
  getVulnerability: (id) => request(`/vulnerabilities/${id}`),
  createVulnerability: (payload) =>
    request("/vulnerabilities", { method: "POST", body: JSON.stringify(payload) }),
  updateVulnerability: (id, payload) =>
    request(`/vulnerabilities/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteVulnerability: (id) => request(`/vulnerabilities/${id}`, { method: "DELETE" }),

  listRiskAssessments: () => request("/risk-assessments"),
  getRiskAssessment: (id) => request(`/risk-assessments/${id}`),
  createRiskAssessment: (payload) =>
    request("/risk-assessments", { method: "POST", body: JSON.stringify(payload) }),
  updateRiskAssessment: (id, payload) =>
    request(`/risk-assessments/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteRiskAssessment: (id) => request(`/risk-assessments/${id}`, { method: "DELETE" }),
  calculateProbability: (payload) =>
    request("/risk-assessments/probability", { method: "POST", body: JSON.stringify(payload) }),
  calculateImpact: (payload) =>
    request("/risk-assessments/impact", { method: "POST", body: JSON.stringify(payload) }),
  calculateRisk: (payload) =>
    request("/risk-assessments/calculate", { method: "POST", body: JSON.stringify(payload) }),

  monteCarlo: (payload) =>
    request("/simulations/monte-carlo", { method: "POST", body: JSON.stringify(payload) }),
  getSimulation: (id) => request(`/simulations/${id}`),
  bayesianUpdate: (payload) =>
    request("/bayesian/update", { method: "POST", body: JSON.stringify(payload) }),

  listMitigations: () => request("/mitigations"),
  createMitigation: (payload) =>
    request("/mitigations", { method: "POST", body: JSON.stringify(payload) }),
  updateMitigation: (id, payload) =>
    request(`/mitigations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  listReports: () => request("/reports"),
  generateReport: (payload) =>
    request("/reports/generate", { method: "POST", body: JSON.stringify(payload) }),
  getReport: (id) => request(`/reports/${id}`),

  dashboardSummary: () => request("/dashboard/summary"),
  riskDistribution: () => request("/dashboard/risk-distribution"),
  topRisks: () => request("/dashboard/top-risks"),
  trends: () => request("/dashboard/trends"),

  auditLogs: () => request("/audit-logs"),
  users: () => request("/admin/users"),
  updateUser: (id, payload) =>
    request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  settings: () => request("/settings"),
  updateSetting: (id, payload) =>
    request(`/settings/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  health: () => request("/health"),
};
