export const apiCatalog = {
  auth: ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me"],
  users: ["/api/users", "/api/users/:id"],
  assets: ["/api/assets", "/api/assets/:id"],
  threats: ["/api/threats", "/api/threats/:id"],
  vulnerabilities: ["/api/vulnerabilities", "/api/vulnerabilities/:id"],
  controls: ["/api/controls", "/api/controls/:id"],
  riskAssessments: [
    "/api/risk-assessments",
    "/api/risk-assessments/calculate",
    "/api/risk-assessments/:id",
  ],
  dashboard: [
    "/api/dashboard/summary",
    "/api/dashboard/risk-distribution",
    "/api/dashboard/risk-trends",
    "/api/dashboard/critical-risks",
    "/api/dashboard/recent-activity",
  ],
  reports: ["/api/reports", "/api/reports/generate", "/api/reports/:id/download"],
  audit: ["/api/audit-logs"],
};

export function mockApi<T>(data: T, delay = 180) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(data), delay);
  });
}
