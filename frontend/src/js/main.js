import { api, clearSession, downloadProtectedFile, getApiBase, getSession, setApiBase, setSession } from "./api.js";
import {
  AppShell,
  AssetCard,
  AuditLogTable,
  BayesianUpdatePanel,
  DashboardCharts,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MitigationTable,
  MonteCarloChart,
  PageHeader,
  PublicShell,
  ReportCard,
  RiskAssessmentForm,
  RiskBadge,
  RiskMatrix,
  StatCard,
  ThreatCard,
  VulnerabilityTable,
  formatCurrency,
  formatNumber,
} from "./components.js";
import { enumLabel, getLocale, loadLocale, t } from "./i18n.js";

const app = document.getElementById("app");

const state = {
  user: null,
  locale: localStorage.getItem("cyberrisk.locale") || "uz",
};

const assetTypes = [
  "Web application",
  "Database",
  "Server",
  "Network device",
  "User account",
  "API service",
  "Cloud storage",
  "IoT device",
  "Mobile application",
  "File server",
  "Email system",
];

const threatCategories = [
  "Phishing",
  "Malware",
  "Ransomware",
  "DDoS",
  "Unauthorized access",
  "Data leakage",
  "Insider threat",
  "SQL injection",
  "XSS",
  "Credential stuffing",
  "API abuse",
  "Supply chain attack",
];

const criticalityLevels = ["Low", "Medium", "High", "Critical"];
const dataSensitivityLevels = ["Public", "Internal", "Confidential", "Restricted"];
const exposureLevels = ["Low", "Medium", "High", "Very High"];
const likelihoodLevels = ["Very Low", "Low", "Medium", "High", "Very High"];
const severityLevels = ["Low", "Medium", "High", "Critical"];
const vulnerabilityStatuses = ["open", "in_progress", "mitigated", "accepted", "false_positive"];
const mitigationStatuses = ["planned", "in_progress", "completed", "delayed", "accepted"];
const reportTypes = [
  "General Risk Report",
  "Asset Risk Report",
  "Critical Risk Report",
  "Department Risk Report",
  "Monte Carlo Simulation Report",
  "Mitigation Report",
  "Audit Report",
];
const roleOptions = ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"];

function localeOptions() {
  return [
    { value: "uz", label: t("language.uz") },
    { value: "ru", label: t("language.ru") },
    { value: "en", label: t("language.en") },
    { value: "tr", label: t("language.tr") },
  ];
}

function hasRole(...names) {
  const userRoles = new Set((state.user?.roles || []).map((role) => role.name));
  return names.some((name) => userRoles.has(name));
}

function isPublicPath(pathname) {
  return ["/", "/about", "/methodology", "/login", "/register"].includes(pathname);
}

function buildNavigation() {
  const items = [
    { href: "/dashboard", icon: "◫", label: t("nav.dashboard"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/assets", icon: "▣", label: t("nav.assets"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/threats", icon: "◈", label: t("nav.threats"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/vulnerabilities", icon: "△", label: t("nav.vulnerabilities"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/risk-assessment", icon: "◎", label: t("nav.riskAssessment"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/risk-matrix", icon: "▦", label: t("nav.riskMatrix"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/monte-carlo", icon: "≈", label: t("nav.monteCarlo"), roles: ["Admin", "Cybersecurity Analyst", "Manager"] },
    { href: "/bayesian-update", icon: "β", label: t("nav.bayesian"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager"] },
    { href: "/mitigation", icon: "✓", label: t("nav.mitigation"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/reports", icon: "▤", label: t("nav.reports"), roles: ["Admin", "Cybersecurity Analyst", "Auditor", "Manager", "Viewer"] },
    { href: "/audit-logs", icon: "⌘", label: t("nav.auditLogs"), roles: ["Admin", "Auditor", "Manager"] },
    { href: "/admin/users", icon: "◌", label: t("nav.userManagement"), roles: ["Admin"] },
    { href: "/settings", icon: "⚙", label: t("nav.settings"), roles: ["Admin", "Manager"] },
  ];
  return items.filter((item) => !state.user || item.roles.some((role) => hasRole(role)));
}

function navigate(path) {
  history.pushState({}, "", path);
  renderRoute();
}

function mountPublic(content) {
  app.innerHTML = PublicShell({
    content,
    localeOptions: localeOptions(),
    activeLocale: getLocale(),
    t,
  });
  bindLocaleButtons();
}

function mountApp(content) {
  app.innerHTML = AppShell({
    navigation: buildNavigation(),
    route: window.location.pathname,
    content,
    user: state.user,
    t,
  });
  const localeSwitcher = document.getElementById("locale-switcher");
  if (localeSwitcher) {
    localeSwitcher.value = getLocale();
    localeSwitcher.addEventListener("change", async (event) => {
      await loadLocale(event.target.value);
      renderRoute();
    });
  }
}

function bindLocaleButtons() {
  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.addEventListener("click", async () => {
      await loadLocale(button.dataset.locale);
      renderRoute();
    });
  });
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    navigate("/login");
  }
}

function updateRangeOutputs(container) {
  container.querySelectorAll('input[type="range"]').forEach((input) => {
    const output = input.parentElement.querySelector("output");
    if (output) output.textContent = input.value;
    input.addEventListener("input", () => {
      if (output) output.textContent = input.value;
    });
  });
}

function optionList(values, prefix, selected) {
  return values
    .map((value) => {
      const isSelected = selected === value ? "selected" : "";
      return `<option value="${value}" ${isSelected}>${enumLabel(prefix, value)}</option>`;
    })
    .join("");
}

function layout(title, subtitle, body, actions = "") {
  return `${PageHeader({ title, subtitle, actions })}${body}`;
}

function formJson(formElement) {
  const formData = new FormData(formElement);
  return Object.fromEntries(formData.entries());
}

function htmlTable(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>`;
}

function buildSimulationHistogram(assessments) {
  const values = assessments.map((item) => item.expected_annual_loss);
  if (!values.length) {
    return { counts: [0], edges: [0] };
  }
  const max = Math.max(...values);
  const step = Math.max(max / 8, 1);
  const counts = Array.from({ length: 8 }, () => 0);
  const edges = counts.map((_, index) => index * step);
  values.forEach((value) => {
    const index = Math.min(Math.floor(value / step), counts.length - 1);
    counts[index] += 1;
  });
  return { counts, edges };
}

function enrichVulnerabilities(vulnerabilities, assets) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset.asset_name]));
  return vulnerabilities.map((item) => ({ ...item, asset_name: assetMap.get(item.asset_id) }));
}

async function bootstrapSession() {
  const session = getSession();
  if (!session?.token) {
    state.user = null;
    return;
  }
  try {
    state.user = await api.me();
    setSession({ token: session.token, user: state.user });
  } catch {
    clearSession();
    state.user = null;
  }
}

async function handleAuthLogout() {
  try {
    await api.logout();
  } catch {
    // server-side logout tracking is best-effort
  }
  clearSession();
  state.user = null;
  navigate("/login");
}

async function renderRoute() {
  app.innerHTML = LoadingSkeleton();
  const path = window.location.pathname;

  try {
    if (!isPublicPath(path) && !state.user) {
      redirectToLogin();
      return;
    }

    if (path === "/") return renderHome();
    if (path === "/about") return renderAbout();
    if (path === "/methodology") return renderMethodology();
    if (path === "/login") return renderLogin();
    if (path === "/register") return renderRegister();
    if (path === "/dashboard") return renderDashboard();
    if (path === "/assets") return renderAssets();
    if (path === "/assets/new") return renderAssetNew();
    if (/^\/assets\/\d+$/.test(path)) return renderAssetDetail(Number(path.split("/")[2]));
    if (path === "/threats") return renderThreats();
    if (path === "/vulnerabilities") return renderVulnerabilities();
    if (path === "/risk-assessment") return renderRiskAssessments();
    if (path === "/risk-assessment/new") return renderRiskAssessmentNew();
    if (path === "/risk-matrix") return renderRiskMatrixPage();
    if (path === "/monte-carlo") return renderMonteCarloPage();
    if (path === "/bayesian-update") return renderBayesianPage();
    if (path === "/mitigation") return renderMitigationPage();
    if (path === "/reports") return renderReportsPage();
    if (/^\/reports\/\d+$/.test(path)) return renderReportDetail(Number(path.split("/")[2]));
    if (path === "/admin/users") return renderUsersPage();
    if (path === "/settings") return renderSettingsPage();
    if (path === "/audit-logs") return renderAuditPage();

    mountPublic(`<section class="hero-panel">${EmptyState(t("empty.pageTitle"), t("empty.pageText"))}</section>`);
  } catch (error) {
    const message = error?.message || t("errors.generic");
    if (error?.status === 401) {
      clearSession();
      state.user = null;
      redirectToLogin();
      return;
    }
    const body = layout(t("errors.pageTitle"), message, ErrorState(message));
    if (isPublicPath(path)) {
      mountPublic(`<section class="hero-panel">${body}</section>`);
    } else {
      mountApp(body);
    }
  }
}

function bindAssetForm(form, initial = {}) {
  form.querySelector('[name="asset_type"]').innerHTML = optionList(assetTypes, "assetType", initial.asset_type || assetTypes[0]);
  form.querySelector('[name="business_criticality"]').innerHTML = optionList(
    criticalityLevels,
    "businessCriticality",
    initial.business_criticality || "Medium"
  );
  form.querySelector('[name="data_sensitivity"]').innerHTML = optionList(
    dataSensitivityLevels,
    "dataSensitivity",
    initial.data_sensitivity || "Internal"
  );
  form.querySelector('[name="internet_exposure"]').innerHTML = optionList(
    exposureLevels,
    "likelihood",
    initial.internet_exposure || "Medium"
  );
}

function assetFormMarkup(asset = {}) {
  return `
    <form id="asset-form" class="form-grid">
      <label><span>${t("field.assetName")}</span><input name="asset_name" value="${asset.asset_name || ""}" required /></label>
      <label><span>${t("field.assetType")}</span><select name="asset_type"></select></label>
      <label><span>${t("field.owner")}</span><input name="owner" value="${asset.owner || ""}" required /></label>
      <label><span>${t("field.department")}</span><input name="department" value="${asset.department || ""}" required /></label>
      <label><span>${t("field.assetValue")}</span><input type="number" step="1" name="asset_value" value="${asset.asset_value || 50}" /></label>
      <label><span>${t("field.businessCriticality")}</span><select name="business_criticality"></select></label>
      <label><span>${t("field.confidentiality")}</span><input type="number" min="1" max="5" name="confidentiality_level" value="${asset.confidentiality_level || 3}" /></label>
      <label><span>${t("field.integrity")}</span><input type="number" min="1" max="5" name="integrity_level" value="${asset.integrity_level || 3}" /></label>
      <label><span>${t("field.availability")}</span><input type="number" min="1" max="5" name="availability_level" value="${asset.availability_level || 3}" /></label>
      <label><span>${t("field.dataSensitivity")}</span><select name="data_sensitivity"></select></label>
      <label><span>${t("field.internetExposure")}</span><select name="internet_exposure"></select></label>
      <label class="full"><span>${t("field.description")}</span><textarea rows="4" name="description">${asset.description || ""}</textarea></label>
      <div class="form-actions full">
        <button class="primary-button" type="submit">${asset.id ? t("button.update") : t("button.create")}</button>
      </div>
    </form>`;
}

function renderHome() {
  const content = `
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="eyebrow">${t("hero.kicker")}</span>
        <h1>${t("hero.title")}</h1>
        <p>${t("hero.subtitle")}</p>
        <div class="hero-actions">
          <a class="primary-button" href="/login" data-link>${t("hero.primaryCta")}</a>
          <a class="ghost-button" href="/methodology" data-link>${t("hero.secondaryCta")}</a>
        </div>
      </div>
      <div class="hero-stats">
        ${StatCard({ label: t("metric.riskFormula"), value: "P × I", accent: "blue", note: t("hero.formulaNote"), icon: "ƒ" })}
        ${StatCard({ label: t("metric.modules"), value: "15", accent: "teal", note: t("hero.modulesNote"), icon: "□" })}
        ${StatCard({ label: t("metric.languages"), value: "4", accent: "navy", note: t("hero.languagesNote"), icon: "✦" })}
      </div>
    </section>
    <section class="feature-grid">
      <article class="panel"><h3>${t("feature.assetsTitle")}</h3><p>${t("feature.assetsText")}</p></article>
      <article class="panel"><h3>${t("feature.analyticsTitle")}</h3><p>${t("feature.analyticsText")}</p></article>
      <article class="panel"><h3>${t("feature.reportingTitle")}</h3><p>${t("feature.reportingText")}</p></article>
      <article class="panel"><h3>${t("feature.governanceTitle")}</h3><p>${t("feature.governanceText")}</p></article>
    </section>`;
  mountPublic(content);
}

function renderAbout() {
  mountPublic(`
    <section class="prose-panel">
      <h1>${t("about.title")}</h1>
      <p>${t("about.lead")}</p>
      <div class="feature-grid">
        <article class="panel"><h3>${t("about.rolesTitle")}</h3><p>${t("about.rolesText")}</p></article>
        <article class="panel"><h3>${t("about.scienceTitle")}</h3><p>${t("about.scienceText")}</p></article>
        <article class="panel"><h3>${t("about.exportsTitle")}</h3><p>${t("about.exportsText")}</p></article>
      </div>
    </section>`);
}

function renderMethodology() {
  mountPublic(`
    <section class="prose-panel">
      <h1>${t("methodology.title")}</h1>
      <p>${t("methodology.lead")}</p>
      <div class="formula-card">
        <strong>${t("methodology.formulaOneTitle")}</strong>
        <code>Risk = Probability × Impact</code>
      </div>
      <div class="formula-card">
        <strong>${t("methodology.formulaTwoTitle")}</strong>
        <code>Risk Score = P(threat) × V(vulnerability) × I(impact) × A(asset value)</code>
      </div>
      <div class="formula-card">
        <strong>${t("methodology.formulaThreeTitle")}</strong>
        <code>Posterior = (Likelihood × Prior) / ((Likelihood × Prior) + (NoRisk × (1 - Prior)))</code>
      </div>
      <p>${t("methodology.monteCarloText")}</p>
    </section>`);
}

function renderLogin() {
  mountPublic(`
    <section class="auth-panel">
      <form id="login-form" class="auth-card">
        <h1>${t("auth.loginTitle")}</h1>
        <p>${t("auth.loginText")}</p>
        <label><span>${t("field.email")}</span><input type="email" name="email" required /></label>
        <label><span>${t("field.password")}</span><input type="password" name="password" required /></label>
        <label><span>${t("field.apiBase")}</span><input name="api_base" value="${getApiBase()}" required /></label>
        <button class="primary-button" type="submit">${t("button.login")}</button>
        <p class="auth-foot">${t("auth.demoText")}</p>
      </form>
    </section>`);
  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = formJson(event.currentTarget);
    setApiBase(form.api_base);
    const response = await api.login({ email: form.email, password: form.password });
    setSession({ token: response.access_token, user: response.user });
    state.user = response.user;
    navigate("/dashboard");
  });
}

function renderRegister() {
  mountPublic(`
    <section class="auth-panel">
      <form id="register-form" class="auth-card">
        <h1>${t("auth.registerTitle")}</h1>
        <p>${t("auth.registerText")}</p>
        <label><span>${t("field.fullName")}</span><input name="full_name" required /></label>
        <label><span>${t("field.email")}</span><input type="email" name="email" required /></label>
        <label><span>${t("field.password")}</span><input type="password" name="password" required /></label>
        <label><span>${t("field.department")}</span><input name="department" /></label>
        <label><span>${t("field.title")}</span><input name="title" /></label>
        <button class="primary-button" type="submit">${t("button.register")}</button>
      </form>
    </section>`);
  document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await api.register(formJson(event.currentTarget));
    navigate("/login");
  });
}

async function renderDashboard() {
  const [summary, distributionPayload, topPayload, trendPayload, assessments, assets, mitigations, auditLogs] =
    await Promise.all([
      api.dashboardSummary(),
      api.riskDistribution(),
      api.topRisks(),
      api.trends(),
      api.listRiskAssessments(),
      api.listAssets(),
      api.listMitigations(),
      hasRole("Admin", "Auditor", "Manager") ? api.auditLogs() : Promise.resolve([]),
    ]);

  const criticalRows = topPayload.top_risks.slice(0, 5).map(
    (item) => `
      <tr>
        <td>${item.asset_name}</td>
        <td>${item.threat_name}</td>
        <td>${RiskBadge(item.risk_level, t)}</td>
        <td>${item.residual_risk}</td>
      </tr>`
  );
  const recentAssets = assets.slice(0, 5).map(
    (item) => `<tr><td>${item.asset_name}</td><td>${enumLabel("assetType", item.asset_type)}</td><td>${item.department}</td><td>${item.updated_at.slice(0, 10)}</td></tr>`
  );
  const mitigationRows = topPayload.pending_mitigations.slice(0, 5).map(
    (item) => `<tr><td>${item.action}</td><td>${enumLabel("mitigationStatus", item.status)}</td><td>${item.deadline || "-"}</td></tr>`
  );
  const auditRows = auditLogs.slice(0, 5).map(
    (item) => `<tr><td>${item.actor_email}</td><td>${item.action}</td><td>${item.entity_type}</td><td>${new Date(item.created_at).toLocaleString()}</td></tr>`
  );

  const cards = `
    <div class="stats-grid">
      ${StatCard({ label: t("metric.totalAssets"), value: formatNumber(summary.total_assets), accent: "navy", icon: "▣" })}
      ${StatCard({ label: t("metric.identifiedThreats"), value: formatNumber(summary.identified_threats), accent: "blue", icon: "◈" })}
      ${StatCard({ label: t("metric.vulnerabilities"), value: formatNumber(summary.vulnerabilities), accent: "teal", icon: "△" })}
      ${StatCard({ label: t("metric.criticalRisks"), value: formatNumber(summary.critical_risks), accent: "red", icon: "!" })}
      ${StatCard({ label: t("metric.highRisks"), value: formatNumber(summary.high_risks), accent: "orange", icon: "▲" })}
      ${StatCard({ label: t("metric.mediumRisks"), value: formatNumber(summary.medium_risks), accent: "yellow", icon: "■" })}
      ${StatCard({ label: t("metric.averageRisk"), value: summary.average_risk_score, accent: "blue", icon: "◎" })}
      ${StatCard({ label: t("metric.expectedLoss"), value: formatCurrency(summary.expected_loss), accent: "teal", icon: "$" })}
    </div>`;

  const charts = DashboardCharts({
    distribution: distributionPayload.distribution,
    trend: trendPayload.trend,
    departments: distributionPayload.department_comparison,
    histogram: buildSimulationHistogram(assessments),
    t,
  });

  const tables = `
    <div class="analytics-grid">
      <section class="panel">
        <h3>${t("table.criticalRisks")}</h3>
        ${htmlTable(
          [t("field.asset"), t("field.threat"), t("field.riskLevel"), t("field.residualRisk")],
          criticalRows.length ? criticalRows : [`<tr><td colspan="4">${t("common.noData")}</td></tr>`]
        )}
      </section>
      <section class="panel">
        <h3>${t("table.recentAssets")}</h3>
        ${htmlTable(
          [t("field.asset"), t("field.assetType"), t("field.department"), t("field.updatedAt")],
          recentAssets.length ? recentAssets : [`<tr><td colspan="4">${t("common.noData")}</td></tr>`]
        )}
      </section>
      <section class="panel">
        <h3>${t("table.pendingMitigations")}</h3>
        ${htmlTable(
          [t("field.action"), t("field.status"), t("field.deadline")],
          mitigationRows.length ? mitigationRows : [`<tr><td colspan="3">${t("common.noData")}</td></tr>`]
        )}
      </section>
      <section class="panel">
        <h3>${t("table.auditActivities")}</h3>
        ${htmlTable(
          [t("field.actor"), t("field.action"), t("field.entity"), t("field.date")],
          auditRows.length ? auditRows : [`<tr><td colspan="4">${t("common.noData")}</td></tr>`]
        )}
      </section>
    </div>`;

  const content = layout(
    t("page.dashboardTitle"),
    t("page.dashboardSubtitle"),
    `${cards}${charts}${tables}`
  );
  mountApp(content);
}

async function renderAssets() {
  const assets = await api.listAssets();
  const rows = assets.map(
    (asset) => `
      <tr>
        <td><a href="/assets/${asset.id}" data-link>${asset.asset_name}</a></td>
        <td>${enumLabel("assetType", asset.asset_type)}</td>
        <td>${asset.owner}</td>
        <td>${asset.department}</td>
        <td>${asset.asset_value}</td>
        <td><button class="inline-button danger" data-delete-asset="${asset.id}">${t("button.delete")}</button></td>
      </tr>`
  );
  const content = layout(
    t("page.assetsTitle"),
    t("page.assetsSubtitle"),
    `${htmlTable(
      [t("field.assetName"), t("field.assetType"), t("field.owner"), t("field.department"), t("field.assetValue"), t("field.actions")],
      rows
    )}`,
    `<a class="primary-button" href="/assets/new" data-link>${t("button.addAsset")}</a>`
  );
  mountApp(content);
  document.querySelectorAll("[data-delete-asset]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.deleteAsset(button.dataset.deleteAsset);
      renderAssets();
    });
  });
}

async function renderAssetNew() {
  const content = layout(t("page.assetNewTitle"), t("page.assetNewSubtitle"), assetFormMarkup());
  mountApp(content);
  const form = document.getElementById("asset-form");
  bindAssetForm(form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formJson(form);
    const created = await api.createAsset({
      ...payload,
      asset_value: Number(payload.asset_value),
      confidentiality_level: Number(payload.confidentiality_level),
      integrity_level: Number(payload.integrity_level),
      availability_level: Number(payload.availability_level),
    });
    navigate(`/assets/${created.id}`);
  });
}

async function renderAssetDetail(assetId) {
  const asset = await api.getAsset(assetId);
  const content = layout(
    asset.asset_name,
    t("page.assetDetailSubtitle"),
    `${AssetCard(asset, t)}${assetFormMarkup(asset)}`
  );
  mountApp(content);
  const form = document.getElementById("asset-form");
  bindAssetForm(form, asset);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formJson(form);
    await api.updateAsset(assetId, {
      ...payload,
      asset_value: Number(payload.asset_value),
      confidentiality_level: Number(payload.confidentiality_level),
      integrity_level: Number(payload.integrity_level),
      availability_level: Number(payload.availability_level),
    });
    renderAssetDetail(assetId);
  });
}

async function renderThreats() {
  const threats = await api.listThreats();
  const rows = threats.map(
    (threat) => `
      <tr>
        <td>${threat.threat_name}</td>
        <td>${enumLabel("threatCategory", threat.threat_category)}</td>
        <td>${enumLabel("likelihood", threat.likelihood)}</td>
        <td>${threat.frequency_per_year}</td>
        <td>
          <button class="inline-button" data-edit-threat="${threat.id}">${t("button.edit")}</button>
          <button class="inline-button danger" data-delete-threat="${threat.id}">${t("button.delete")}</button>
        </td>
      </tr>`
  );
  const options = optionList(threatCategories, "threatCategory", threatCategories[0]);
  const likelihoodOptions = optionList(likelihoodLevels, "likelihood", "Medium");
  const content = layout(
    t("page.threatsTitle"),
    t("page.threatsSubtitle"),
    `
      <form id="threat-form" class="form-grid compact-form">
        <input type="hidden" name="id" />
        <label><span>${t("field.threatName")}</span><input name="threat_name" required /></label>
        <label><span>${t("field.threatCategory")}</span><select name="threat_category">${options}</select></label>
        <label><span>${t("field.likelihood")}</span><select name="likelihood">${likelihoodOptions}</select></label>
        <label><span>${t("field.frequencyPerYear")}</span><input type="number" name="frequency_per_year" value="1" /></label>
        <label><span>${t("field.threatActor")}</span><input name="threat_actor" /></label>
        <label><span>${t("field.attackVector")}</span><input name="attack_vector" /></label>
        <label><span>${t("field.historicalIncidents")}</span><input type="number" name="historical_incidents" value="0" /></label>
        <label class="full"><span>${t("field.description")}</span><textarea name="description" rows="3"></textarea></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.save")}</button></div>
      </form>
      <div class="feature-grid">${threats.slice(0, 3).map((item) => ThreatCard(item, t)).join("")}</div>
      ${htmlTable(
        [t("field.threatName"), t("field.threatCategory"), t("field.likelihood"), t("field.frequencyPerYear"), t("field.actions")],
        rows
      )}
    `
  );
  mountApp(content);

  const form = document.getElementById("threat-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formJson(form);
    const normalized = {
      threat_name: payload.threat_name,
      threat_category: payload.threat_category,
      description: payload.description || "",
      likelihood: payload.likelihood,
      frequency_per_year: Number(payload.frequency_per_year),
      threat_actor: payload.threat_actor || "",
      attack_vector: payload.attack_vector || "",
      historical_incidents: Number(payload.historical_incidents || 0),
    };
    if (payload.id) {
      await api.updateThreat(payload.id, normalized);
    } else {
      await api.createThreat(normalized);
    }
    renderThreats();
  });

  document.querySelectorAll("[data-edit-threat]").forEach((button) => {
    button.addEventListener("click", () => {
      const threat = threats.find((item) => item.id === Number(button.dataset.editThreat));
      if (!threat) return;
      form.querySelector('[name="id"]').value = threat.id;
      form.querySelector('[name="threat_name"]').value = threat.threat_name;
      form.querySelector('[name="threat_category"]').value = threat.threat_category;
      form.querySelector('[name="likelihood"]').value = threat.likelihood;
      form.querySelector('[name="frequency_per_year"]').value = threat.frequency_per_year;
      form.querySelector('[name="threat_actor"]').value = threat.threat_actor;
      form.querySelector('[name="attack_vector"]').value = threat.attack_vector;
      form.querySelector('[name="historical_incidents"]').value = threat.historical_incidents;
      form.querySelector('[name="description"]').value = threat.description;
    });
  });

  document.querySelectorAll("[data-delete-threat]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.deleteThreat(button.dataset.deleteThreat);
      renderThreats();
    });
  });
}

async function renderVulnerabilities() {
  const [vulnerabilities, assets] = await Promise.all([api.listVulnerabilities(), api.listAssets()]);
  const enriched = enrichVulnerabilities(vulnerabilities, assets);
  const rows = enriched.map(
    (item) => `
      <tr>
        <td>${item.vulnerability_name}</td>
        <td>${item.asset_name || item.asset_id}</td>
        <td>${enumLabel("severity", item.severity)}</td>
        <td>${item.cvss_score}</td>
        <td>${enumLabel("vulnerabilityStatus", item.status)}</td>
        <td>
          <button class="inline-button" data-edit-vulnerability="${item.id}">${t("button.edit")}</button>
          <button class="inline-button danger" data-delete-vulnerability="${item.id}">${t("button.delete")}</button>
        </td>
      </tr>`
  );
  const content = layout(
    t("page.vulnerabilitiesTitle"),
    t("page.vulnerabilitiesSubtitle"),
    `
      <form id="vulnerability-form" class="form-grid compact-form">
        <input type="hidden" name="id" />
        <label><span>${t("field.vulnerabilityName")}</span><input name="vulnerability_name" required /></label>
        <label><span>${t("field.asset")}</span><select name="asset_id">${assets
          .map((asset) => `<option value="${asset.id}">${asset.asset_name}</option>`)
          .join("")}</select></label>
        <label><span>${t("field.severity")}</span><select name="severity">${optionList(severityLevels, "severity", "Medium")}</select></label>
        <label><span>${t("field.exploitability")}</span><input type="number" min="1" max="5" name="exploitability" value="3" /></label>
        <label><span>${t("field.cvssScore")}</span><input type="number" min="0" max="10" step="0.1" name="cvss_score" value="5.0" /></label>
        <label><span>${t("field.status")}</span><select name="status">${optionList(vulnerabilityStatuses, "vulnerabilityStatus", "open")}</select></label>
        <label class="full"><span>${t("field.description")}</span><textarea name="description" rows="3"></textarea></label>
        <label class="full"><span>${t("field.remediation")}</span><textarea name="remediation" rows="3"></textarea></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.save")}</button></div>
      </form>
      ${htmlTable(
        [t("field.vulnerabilityName"), t("field.asset"), t("field.severity"), t("field.cvssScore"), t("field.status"), t("field.actions")],
        rows
      )}
    `
  );
  mountApp(content);
  const form = document.getElementById("vulnerability-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = formJson(form);
    const normalized = {
      vulnerability_name: payload.vulnerability_name,
      asset_id: Number(payload.asset_id),
      severity: payload.severity,
      exploitability: Number(payload.exploitability),
      cvss_score: Number(payload.cvss_score),
      description: payload.description || "",
      remediation: payload.remediation || "",
      status: payload.status,
    };
    if (payload.id) {
      await api.updateVulnerability(payload.id, normalized);
    } else {
      await api.createVulnerability(normalized);
    }
    renderVulnerabilities();
  });

  document.querySelectorAll("[data-edit-vulnerability]").forEach((button) => {
    button.addEventListener("click", () => {
      const vulnerability = vulnerabilities.find((item) => item.id === Number(button.dataset.editVulnerability));
      if (!vulnerability) return;
      form.querySelector('[name="id"]').value = vulnerability.id;
      form.querySelector('[name="vulnerability_name"]').value = vulnerability.vulnerability_name;
      form.querySelector('[name="asset_id"]').value = vulnerability.asset_id;
      form.querySelector('[name="severity"]').value = vulnerability.severity;
      form.querySelector('[name="exploitability"]').value = vulnerability.exploitability;
      form.querySelector('[name="cvss_score"]').value = vulnerability.cvss_score;
      form.querySelector('[name="status"]').value = vulnerability.status;
      form.querySelector('[name="description"]').value = vulnerability.description;
      form.querySelector('[name="remediation"]').value = vulnerability.remediation;
    });
  });

  document.querySelectorAll("[data-delete-vulnerability]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.deleteVulnerability(button.dataset.deleteVulnerability);
      renderVulnerabilities();
    });
  });
}

async function renderRiskAssessments() {
  const [assessments, assets, threats] = await Promise.all([
    api.listRiskAssessments(),
    api.listAssets(),
    api.listThreats(),
  ]);
  const assetMap = new Map(assets.map((item) => [item.id, item.asset_name]));
  const threatMap = new Map(threats.map((item) => [item.id, item.threat_name]));
  const rows = assessments.map(
    (item) => `
      <tr>
        <td>${assetMap.get(item.asset_id) || item.asset_id}</td>
        <td>${threatMap.get(item.threat_id) || item.threat_id}</td>
        <td>${item.probability_score}</td>
        <td>${item.impact_score}</td>
        <td>${RiskBadge(item.risk_level, t)}</td>
        <td>${item.residual_risk}</td>
        <td><button class="inline-button danger" data-delete-assessment="${item.id}">${t("button.delete")}</button></td>
      </tr>`
  );
  const content = layout(
    t("page.riskAssessmentTitle"),
    t("page.riskAssessmentSubtitle"),
    htmlTable(
      [t("field.asset"), t("field.threat"), t("field.probabilityScore"), t("field.impactScore"), t("field.riskLevel"), t("field.residualRisk"), t("field.actions")],
      rows
    ),
    `<a class="primary-button" href="/risk-assessment/new" data-link>${t("button.addAssessment")}</a>`
  );
  mountApp(content);
  document.querySelectorAll("[data-delete-assessment]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api.deleteRiskAssessment(button.dataset.deleteAssessment);
      renderRiskAssessments();
    });
  });
}

async function renderRiskAssessmentNew() {
  const [assets, threats, vulnerabilities] = await Promise.all([
    api.listAssets(),
    api.listThreats(),
    api.listVulnerabilities(),
  ]);
  const content = layout(
    t("page.riskAssessmentNewTitle"),
    t("page.riskAssessmentNewSubtitle"),
    RiskAssessmentForm({ assets, threats, vulnerabilities, t })
  );
  mountApp(content);
  const form = document.getElementById("risk-assessment-form");
  updateRangeOutputs(form);
  let preview = null;

  async function calculatePreview() {
    const data = formJson(form);
    const probability = await api.calculateProbability({
      threat_likelihood: Number(data.threat_likelihood),
      historical_frequency: Number(data.historical_frequency),
      exposure_level: Number(data.exposure_level),
      attacker_capability: Number(data.attacker_capability),
      vulnerability_exploitability: Number(data.vulnerability_exploitability),
      control_effectiveness: Number(data.control_effectiveness_percent),
      incident_history: Number(data.incident_history),
    });
    const impact = await api.calculateImpact({
      financial_loss: Number(data.financial_loss),
      downtime_hours: Number(data.downtime_hours),
      data_loss_level: Number(data.data_loss_level),
      reputational_damage: Number(data.reputational_damage),
      legal_consequence: Number(data.legal_consequence),
      operational_disruption: Number(data.operational_disruption),
      customer_impact: Number(data.customer_impact),
      recovery_cost: Number(data.recovery_cost),
    });
    const selectedAsset = assets.find((item) => item.id === Number(data.asset_id));
    const risk = await api.calculateRisk({
      asset_id: Number(data.asset_id),
      threat_id: Number(data.threat_id),
      vulnerability_id: Number(data.vulnerability_id),
      probability_score: probability.probability_percent,
      impact_score: impact.impact_score,
      asset_value: selectedAsset?.asset_value || 50,
      control_effectiveness: Number(data.control_effectiveness),
      financial_impact: Number(data.financial_impact),
    });
    preview = { probability, impact, risk };
    document.getElementById("risk-preview-panel").innerHTML = `
      <div class="preview-panel">
        ${StatCard({ label: t("field.probabilityScore"), value: `${probability.probability_percent}%`, accent: "blue" })}
        ${StatCard({ label: t("field.impactScore"), value: impact.impact_score, accent: "orange" })}
        ${StatCard({ label: t("field.inherentRisk"), value: risk.inherent_risk, accent: "red" })}
        ${StatCard({ label: t("field.residualRisk"), value: risk.residual_risk, accent: "teal" })}
        <p>${risk.recommendation}</p>
      </div>`;
  }

  form.querySelector('[data-action="preview-risk"]').addEventListener("click", calculatePreview);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!preview) {
      await calculatePreview();
    }
    const data = formJson(form);
    await api.createRiskAssessment({
      asset_id: Number(data.asset_id),
      threat_id: Number(data.threat_id),
      vulnerability_id: Number(data.vulnerability_id),
      probability_score: preview.probability.probability_percent,
      impact_score: preview.impact.impact_score,
      control_effectiveness: Number(data.control_effectiveness),
      financial_impact: Number(data.financial_impact),
      notes: data.notes || "",
    });
    navigate("/risk-assessment");
  });
}

async function renderRiskMatrixPage() {
  const [distributionPayload, assessments, assets, threats] = await Promise.all([
    api.riskDistribution(),
    api.listRiskAssessments(),
    api.listAssets(),
    api.listThreats(),
  ]);
  let selectedKey = null;
  const assetMap = new Map(assets.map((asset) => [asset.id, asset.asset_name]));
  const threatMap = new Map(threats.map((threat) => [threat.id, threat.threat_name]));

  const content = layout(
    t("page.riskMatrixTitle"),
    t("page.riskMatrixSubtitle"),
    `
      ${RiskMatrix({ matrix: distributionPayload.matrix, selectedKey, t })}
      <div id="matrix-risk-list" class="panel"></div>
    `
  );
  mountApp(content);

  const listContainer = document.getElementById("matrix-risk-list");
  const renderList = () => {
    const filtered = !selectedKey
      ? assessments
      : assessments.filter(
          (item) =>
            `${item.impact_score <= 20 ? "Very Low" : item.impact_score <= 40 ? "Low" : item.impact_score <= 60 ? "Medium" : item.impact_score <= 80 ? "High" : "Very High"}|${
              item.probability_score <= 20 ? "Very Low" : item.probability_score <= 40 ? "Low" : item.probability_score <= 60 ? "Medium" : item.probability_score <= 80 ? "High" : "Very High"
            }` === selectedKey
        );
    if (!filtered.length) {
      listContainer.innerHTML = EmptyState(t("empty.matrixTitle"), t("empty.matrixText"));
      return;
    }
    listContainer.innerHTML = htmlTable(
      [t("field.asset"), t("field.threat"), t("field.riskLevel"), t("field.residualRisk")],
      filtered.map(
        (item) => `
          <tr>
            <td>${assetMap.get(item.asset_id) || item.asset_id}</td>
            <td>${threatMap.get(item.threat_id) || item.threat_id}</td>
            <td>${RiskBadge(item.risk_level, t)}</td>
            <td>${item.residual_risk}</td>
          </tr>`
      )
    );
  };

  renderList();
  document.querySelectorAll("[data-matrix-key]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedKey = button.dataset.matrixKey;
      document.querySelectorAll("[data-matrix-key]").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      renderList();
    });
  });
}

async function renderMonteCarloPage() {
  const assessments = await api.listRiskAssessments();
  const content = layout(
    t("page.monteCarloTitle"),
    t("page.monteCarloSubtitle"),
    `
      <form id="simulation-form" class="form-grid compact-form">
        <label><span>${t("field.riskAssessment")}</span><select name="risk_assessment_id"><option value="">-</option>${assessments
          .map((item) => `<option value="${item.id}">#${item.id} ${item.risk_level}</option>`)
          .join("")}</select></label>
        <label><span>${t("field.probabilityMin")}</span><input type="number" min="0" max="1" step="0.01" name="probability_min" value="0.2" /></label>
        <label><span>${t("field.probabilityMax")}</span><input type="number" min="0" max="1" step="0.01" name="probability_max" value="0.8" /></label>
        <label><span>${t("field.impactMin")}</span><input type="number" min="0" step="100" name="impact_min" value="10000" /></label>
        <label><span>${t("field.impactMax")}</span><input type="number" min="0" step="100" name="impact_max" value="80000" /></label>
        <label><span>${t("field.assetValue")}</span><input type="number" min="0" step="1" name="asset_value" value="1" /></label>
        <label><span>${t("field.iterations")}</span><select name="iterations"><option>1000</option><option selected>5000</option><option>10000</option></select></label>
        <label><span>${t("field.distributionType")}</span><select name="distribution_type"><option value="uniform">uniform</option><option value="triangular">triangular</option><option value="normal">normal</option></select></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.runSimulation")}</button></div>
      </form>
      <div id="simulation-result">${MonteCarloChart(null, t)}</div>
    `
  );
  mountApp(content);
  document.getElementById("simulation-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formJson(event.currentTarget);
    const result = await api.monteCarlo({
      risk_assessment_id: data.risk_assessment_id ? Number(data.risk_assessment_id) : null,
      probability_min: Number(data.probability_min),
      probability_max: Number(data.probability_max),
      impact_min: Number(data.impact_min),
      impact_max: Number(data.impact_max),
      asset_value: Number(data.asset_value),
      iterations: Number(data.iterations),
      distribution_type: data.distribution_type,
    });
    document.getElementById("simulation-result").innerHTML = MonteCarloChart(result, t);
  });
}

async function renderBayesianPage() {
  const assessments = await api.listRiskAssessments();
  const content = layout(
    t("page.bayesianTitle"),
    t("page.bayesianSubtitle"),
    `
      <form id="bayesian-form" class="form-grid compact-form">
        <label><span>${t("field.riskAssessment")}</span><select name="risk_assessment_id">${assessments
          .map((item) => `<option value="${item.id}">#${item.id} ${item.risk_level}</option>`)
          .join("")}</select></label>
        <label><span>${t("field.priorProbability")}</span><input type="number" min="0" max="1" step="0.01" name="prior_probability" value="0.4" /></label>
        <label><span>${t("field.likelihoodGivenRisk")}</span><input type="number" min="0" max="1" step="0.01" name="evidence_likelihood_given_risk" value="0.8" /></label>
        <label><span>${t("field.likelihoodGivenNoRisk")}</span><input type="number" min="0" max="1" step="0.01" name="evidence_likelihood_given_no_risk" value="0.2" /></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.calculate")}</button></div>
      </form>
      <div id="bayesian-result">${BayesianUpdatePanel(null, t)}</div>
    `
  );
  mountApp(content);
  document.getElementById("bayesian-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formJson(event.currentTarget);
    const result = await api.bayesianUpdate({
      risk_assessment_id: Number(data.risk_assessment_id),
      prior_probability: Number(data.prior_probability),
      evidence_likelihood_given_risk: Number(data.evidence_likelihood_given_risk),
      evidence_likelihood_given_no_risk: Number(data.evidence_likelihood_given_no_risk),
    });
    document.getElementById("bayesian-result").innerHTML = BayesianUpdatePanel(result, t);
  });
}

async function renderMitigationPage() {
  const [assessments, mitigations] = await Promise.all([api.listRiskAssessments(), api.listMitigations()]);
  const content = layout(
    t("page.mitigationTitle"),
    t("page.mitigationSubtitle"),
    `
      <form id="mitigation-form" class="form-grid compact-form">
        <label><span>${t("field.riskAssessment")}</span><select name="risk_id">${assessments
          .map((item) => `<option value="${item.id}">#${item.id} ${item.risk_level}</option>`)
          .join("")}</select></label>
        <label><span>${t("field.responsiblePerson")}</span><input name="responsible_person" required /></label>
        <label><span>${t("field.deadline")}</span><input type="date" name="deadline" /></label>
        <label><span>${t("field.cost")}</span><input type="number" name="cost" value="0" /></label>
        <label><span>${t("field.expectedRiskReduction")}</span><input type="number" name="expected_risk_reduction" value="10" /></label>
        <label><span>${t("field.progress")}</span><input type="number" min="0" max="100" name="progress" value="0" /></label>
        <label><span>${t("field.status")}</span><select name="status">${optionList(mitigationStatuses, "mitigationStatus", "planned")}</select></label>
        <label class="full"><span>${t("field.action")}</span><textarea rows="3" name="mitigation_action" required></textarea></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.addMitigation")}</button></div>
      </form>
      ${MitigationTable(mitigations, t)}
    `
  );
  mountApp(content);
  document.getElementById("mitigation-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formJson(event.currentTarget);
    await api.createMitigation({
      risk_id: Number(data.risk_id),
      mitigation_action: data.mitigation_action,
      responsible_person: data.responsible_person,
      deadline: data.deadline ? `${data.deadline}T00:00:00` : null,
      cost: Number(data.cost),
      expected_risk_reduction: Number(data.expected_risk_reduction),
      status: data.status,
      progress: Number(data.progress),
    });
    renderMitigationPage();
  });
}

async function renderReportsPage() {
  const reports = await api.listReports();
  const content = layout(
    t("page.reportsTitle"),
    t("page.reportsSubtitle"),
    `
      <form id="report-form" class="form-grid compact-form">
        <label><span>${t("field.reportType")}</span><select name="report_type">${reportTypes
          .map((item) => `<option value="${item}">${enumLabel("reportType", item)}</option>`)
          .join("")}</select></label>
        <label><span>${t("field.reportTitle")}</span><input name="title" required /></label>
        <label class="full"><span>${t("field.executiveSummary")}</span><textarea rows="4" name="executive_summary"></textarea></label>
        <div class="form-actions full"><button class="primary-button" type="submit">${t("button.generateReport")}</button></div>
      </form>
      <div class="feature-grid">${reports.length ? reports.map((report) => ReportCard(report, t)).join("") : EmptyState(t("empty.reportsTitle"), t("empty.reportsText"))}</div>
    `
  );
  mountApp(content);
  document.getElementById("report-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const report = await api.generateReport(formJson(event.currentTarget));
    navigate(`/reports/${report.id}`);
  });
}

async function renderReportDetail(reportId) {
  const report = await api.getReport(reportId);
  const summaryRows = Object.entries(report.content_json.summary || {}).map(
    ([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`
  );
  const topRiskRows = (report.content_json.top_risks || []).map(
    (item) => `<tr><td>#${item.id}</td><td>${item.risk_level}</td><td>${item.residual_risk}</td></tr>`
  );
  const content = layout(
    report.title,
    report.executive_summary || t("common.reportSummaryPlaceholder"),
    `
      <div class="stats-grid">
        ${StatCard({ label: t("field.reportType"), value: enumLabel("reportType", report.report_type), accent: "navy" })}
        ${StatCard({ label: t("field.date"), value: new Date(report.report_date).toLocaleDateString(), accent: "blue" })}
      </div>
      <section class="panel">
        <h3>${t("table.summary")}</h3>
        ${htmlTable([t("field.metric"), t("field.value")], summaryRows)}
      </section>
      <section class="panel">
        <h3>${t("table.topRisks")}</h3>
        ${htmlTable([t("field.id"), t("field.riskLevel"), t("field.residualRisk")], topRiskRows)}
      </section>
    `,
    `
      <button class="ghost-button" id="download-pdf">${t("button.exportPdf")}</button>
      <button class="primary-button" id="download-excel">${t("button.exportExcel")}</button>
    `
  );
  mountApp(content);
  document.getElementById("download-pdf").addEventListener("click", () =>
    downloadProtectedFile(`/reports/${reportId}/pdf`, `report-${reportId}.pdf`)
  );
  document.getElementById("download-excel").addEventListener("click", () =>
    downloadProtectedFile(`/reports/${reportId}/excel`, `report-${reportId}.xls`)
  );
}

async function renderUsersPage() {
  if (!hasRole("Admin")) {
    throw new Error(t("errors.accessDenied"));
  }
  const users = await api.users();
  const content = layout(
    t("page.usersTitle"),
    t("page.usersSubtitle"),
    htmlTable(
      [t("field.fullName"), t("field.email"), t("field.role"), t("field.active"), t("field.actions")],
      users.map(
        (user) => `
          <tr>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td>
              <select data-user-role="${user.id}">
                ${roleOptions
                  .map((role) => `<option value="${role}" ${user.roles?.[0]?.name === role ? "selected" : ""}>${enumLabel("role", role)}</option>`)
                  .join("")}
              </select>
            </td>
            <td><input type="checkbox" data-user-active="${user.id}" ${user.is_active ? "checked" : ""} /></td>
            <td><button class="inline-button" data-save-user="${user.id}">${t("button.save")}</button></td>
          </tr>`
      )
    )
  );
  mountApp(content);
  document.querySelectorAll("[data-save-user]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.saveUser);
      const role = document.querySelector(`[data-user-role="${id}"]`).value;
      const active = document.querySelector(`[data-user-active="${id}"]`).checked;
      await api.updateUser(id, { role_names: [role], is_active: active });
      renderUsersPage();
    });
  });
}

async function renderSettingsPage() {
  if (!hasRole("Admin", "Manager")) {
    throw new Error(t("errors.accessDenied"));
  }
  const settings = await api.settings();
  const content = layout(
    t("page.settingsTitle"),
    t("page.settingsSubtitle"),
    `
      <div class="panel">
        ${settings
          .map(
            (item) => `
              <form class="settings-row" data-setting-id="${item.id}">
                <div>
                  <strong>${item.key}</strong>
                  <p>${item.description}</p>
                </div>
                <input name="value" value="${item.value}" />
                <button class="inline-button" type="submit">${t("button.save")}</button>
              </form>`
          )
          .join("")}
      </div>
    `
  );
  mountApp(content);
  document.querySelectorAll("[data-setting-id]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = Number(form.dataset.settingId);
      const value = form.querySelector('[name="value"]').value;
      await api.updateSetting(id, { value });
    });
  });
}

async function renderAuditPage() {
  if (!hasRole("Admin", "Auditor", "Manager")) {
    throw new Error(t("errors.accessDenied"));
  }
  const logs = await api.auditLogs();
  const content = layout(t("page.auditTitle"), t("page.auditSubtitle"), AuditLogTable(logs, t));
  mountApp(content);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (link) {
    event.preventDefault();
    navigate(link.getAttribute("href"));
    return;
  }
  const logoutButton = event.target.closest('[data-action="logout"]');
  if (logoutButton) {
    event.preventDefault();
    handleAuthLogout();
  }
});

window.addEventListener("popstate", renderRoute);

await loadLocale(state.locale);
await bootstrapSession();
renderRoute();
