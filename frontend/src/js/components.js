import { renderBarChart, renderDonutChart, renderHistogram, renderLineChart } from "./charts.js";
import { enumLabel } from "./i18n.js";

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export function RiskBadge(level, t) {
  const tone = String(level || "Low").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="risk-badge risk-${tone}">${enumLabel("riskLevel", level || t("riskLevel.low"))}</span>`;
}

export function PageHeader({ title, subtitle, actions = "" }) {
  return `
    <section class="page-header">
      <div>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="page-header-actions">${actions}</div>
    </section>`;
}

export function StatCard({ label, value, accent = "navy", note = "", icon = "" }) {
  return `
    <article class="stat-card accent-${accent}">
      <div class="stat-icon">${icon || "●"}</div>
      <div class="stat-body">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${note}</small>
      </div>
    </article>`;
}

export function EmptyState(title, description) {
  return `
    <div class="empty-state">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>`;
}

export function LoadingSkeleton() {
  return `
    <div class="skeleton-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>`;
}

export function ErrorState(message) {
  return `
    <div class="error-state">
      <h3>Something went wrong</h3>
      <p>${message}</p>
    </div>`;
}

export function AppShell({ navigation, route, content, user, t }) {
  const initials = (user?.full_name || "CR")
    .split(" ")
    .map((part) => part[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navHtml = navigation
    .map((item) => {
      const active = route === item.href ? "active" : "";
      return `
        <a class="sidebar-link ${active}" href="${item.href}" data-link>
          <span>${item.icon}</span>
          <span>${item.label}</span>
        </a>`;
    })
    .join("");

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand-panel">
          <div class="brand-mark">CR</div>
          <div>
            <h2>${t("app.shortTitle")}</h2>
            <p>${t("app.sidebarCaption")}</p>
          </div>
        </div>
        <nav class="sidebar-nav">${navHtml}</nav>
        <div class="sidebar-foot">
          <small>${t("app.scienceNote")}</small>
        </div>
      </aside>
      <main class="main-shell">
        <header class="topbar">
          <div class="topbar-search">
            <input id="global-search" type="search" placeholder="${t("common.searchPlaceholder")}" />
          </div>
          <div class="topbar-actions">
            <select id="locale-switcher" aria-label="${t("common.language")}">
              <option value="uz">${t("language.uz")}</option>
              <option value="ru">${t("language.ru")}</option>
              <option value="en">${t("language.en")}</option>
              <option value="tr">${t("language.tr")}</option>
            </select>
            <button class="ghost-button" data-action="logout">${t("button.logout")}</button>
            <div class="user-chip">
              <span class="user-avatar">${initials}</span>
              <div>
                <strong>${user?.full_name || "User"}</strong>
                <small>${user?.roles?.[0]?.name || "Viewer"}</small>
              </div>
            </div>
          </div>
        </header>
        <section class="content-shell">${content}</section>
      </main>
    </div>`;
}

export function PublicShell({ content, localeOptions, activeLocale, t }) {
  const localeHtml = localeOptions
    .map(
      (item) =>
        `<button class="locale-pill ${item.value === activeLocale ? "active" : ""}" data-locale="${item.value}">${item.label}</button>`
    )
    .join("");

  return `
    <div class="public-shell">
      <header class="public-topbar">
        <a href="/" data-link class="public-brand">
          <span>CR</span>
          <div>
            <strong>${t("app.shortTitle")}</strong>
            <small>${t("app.publicCaption")}</small>
          </div>
        </a>
        <nav class="public-nav">
          <a href="/" data-link>${t("nav.home")}</a>
          <a href="/about" data-link>${t("nav.about")}</a>
          <a href="/methodology" data-link>${t("nav.methodology")}</a>
          <a href="/login" data-link>${t("button.login")}</a>
        </nav>
        <div class="locale-pills">${localeHtml}</div>
      </header>
      ${content}
    </div>`;
}

export function AssetCard(asset, t) {
  return `
    <article class="entity-card">
      <div class="entity-card-head">
        <h3>${asset.asset_name}</h3>
        ${RiskBadge(asset.business_criticality === "Critical" ? "Critical" : "Medium", t)}
      </div>
      <dl class="entity-grid">
        <div><dt>${t("field.assetType")}</dt><dd>${enumLabel("assetType", asset.asset_type)}</dd></div>
        <div><dt>${t("field.owner")}</dt><dd>${asset.owner}</dd></div>
        <div><dt>${t("field.department")}</dt><dd>${asset.department}</dd></div>
        <div><dt>${t("field.assetValue")}</dt><dd>${formatNumber(asset.asset_value)}</dd></div>
      </dl>
      <p>${asset.description || t("common.noDescription")}</p>
    </article>`;
}

export function ThreatCard(threat, t) {
  return `
    <article class="entity-card compact">
      <div class="entity-card-head">
        <h3>${threat.threat_name}</h3>
        <span class="subtle-pill">${enumLabel("likelihood", threat.likelihood)}</span>
      </div>
      <p>${threat.description || t("common.noDescription")}</p>
      <div class="entity-meta">
        <span>${enumLabel("threatCategory", threat.threat_category)}</span>
        <strong>${threat.frequency_per_year}/y</strong>
      </div>
    </article>`;
}

export function VulnerabilityTable(items, t) {
  if (!items.length) {
    return EmptyState(t("empty.vulnerabilitiesTitle"), t("empty.vulnerabilitiesText"));
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("field.vulnerabilityName")}</th>
            <th>${t("field.asset")}</th>
            <th>${t("field.severity")}</th>
            <th>${t("field.exploitability")}</th>
            <th>${t("field.cvssScore")}</th>
            <th>${t("field.status")}</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr>
                  <td>${item.vulnerability_name}</td>
                  <td>${item.asset_name || item.asset_id}</td>
                  <td>${enumLabel("severity", item.severity)}</td>
                  <td>${item.exploitability}</td>
                  <td>${item.cvss_score}</td>
                  <td><span class="status-pill">${enumLabel("vulnerabilityStatus", item.status)}</span></td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

export function ProbabilitySlider(name, label, value = 50) {
  return `
    <label class="slider-field">
      <span>${label}</span>
      <input type="range" min="0" max="100" step="1" name="${name}" value="${value}" />
      <output>${value}</output>
    </label>`;
}

export function ImpactSlider(name, label, value = 50) {
  return ProbabilitySlider(name, label, value);
}

export function RiskAssessmentForm({ assets, threats, vulnerabilities, t }) {
  return `
    <form id="risk-assessment-form" class="form-grid">
      <label>
        <span>${t("field.asset")}</span>
        <select name="asset_id" required>
          ${assets.map((item) => `<option value="${item.id}">${item.asset_name}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>${t("field.threat")}</span>
        <select name="threat_id" required>
          ${threats.map((item) => `<option value="${item.id}">${item.threat_name}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>${t("field.vulnerability")}</span>
        <select name="vulnerability_id" required>
          ${vulnerabilities
            .map((item) => `<option value="${item.id}">${item.vulnerability_name}</option>`)
            .join("")}
        </select>
      </label>
      <label>
        <span>${t("field.controlEffectiveness")}</span>
        <input type="number" name="control_effectiveness" min="0" max="1" step="0.05" value="0.3" />
      </label>
      <label>
        <span>${t("field.financialImpact")}</span>
        <input type="number" name="financial_impact" min="0" step="1000" value="50000" />
      </label>
      <label class="full">
        <span>${t("field.notes")}</span>
        <textarea name="notes" rows="3"></textarea>
      </label>
      <div class="form-section full">
        <h3>${t("page.probability")}</h3>
        <div class="slider-grid">
          ${ProbabilitySlider("threat_likelihood", t("field.threatLikelihood"), 60)}
          ${ProbabilitySlider("historical_frequency", t("field.historicalFrequency"), 45)}
          ${ProbabilitySlider("exposure_level", t("field.exposureLevel"), 55)}
          ${ProbabilitySlider("attacker_capability", t("field.attackerCapability"), 60)}
          ${ProbabilitySlider("vulnerability_exploitability", t("field.vulnerabilityExploitability"), 65)}
          ${ProbabilitySlider("control_effectiveness_percent", t("field.controlEffectivenessPercent"), 30)}
          ${ProbabilitySlider("incident_history", t("field.incidentHistory"), 40)}
        </div>
      </div>
      <div class="form-section full">
        <h3>${t("page.impact")}</h3>
        <div class="slider-grid">
          ${ImpactSlider("financial_loss", t("field.financialLoss"), 60)}
          ${ImpactSlider("downtime_hours", t("field.downtimeHours"), 45)}
          ${ImpactSlider("data_loss_level", t("field.dataLossLevel"), 50)}
          ${ImpactSlider("reputational_damage", t("field.reputationalDamage"), 55)}
          ${ImpactSlider("legal_consequence", t("field.legalConsequence"), 40)}
          ${ImpactSlider("operational_disruption", t("field.operationalDisruption"), 58)}
          ${ImpactSlider("customer_impact", t("field.customerImpact"), 48)}
          ${ImpactSlider("recovery_cost", t("field.recoveryCost"), 50)}
        </div>
      </div>
      <div class="form-actions full">
        <button class="primary-button" type="button" data-action="preview-risk">${t("button.calculate")}</button>
        <button class="primary-button" type="submit">${t("button.saveAssessment")}</button>
      </div>
    </form>
    <div id="risk-preview-panel"></div>`;
}

export function RiskMatrix({ matrix, selectedKey, t }) {
  const impactLevels = ["Very Low", "Low", "Medium", "High", "Very High"];
  const probabilityLevels = ["Very Low", "Low", "Medium", "High", "Very High"];
  const colorMap = {
    Low: "var(--green)",
    Medium: "var(--yellow)",
    High: "var(--orange)",
    Critical: "var(--red)",
  };
  const body = impactLevels
    .map((impact) => {
      const cells = probabilityLevels
        .map((probability) => {
          const key = `${impact}|${probability}`;
          const count = matrix[key] || 0;
          const scoreIndex = impactLevels.indexOf(impact) + probabilityLevels.indexOf(probability);
          const level = scoreIndex <= 2 ? "Low" : scoreIndex <= 4 ? "Medium" : scoreIndex <= 6 ? "High" : "Critical";
          return `
            <button class="matrix-cell ${selectedKey === key ? "selected" : ""}" data-matrix-key="${key}" style="background:${colorMap[level]}">
              <span>${count}</span>
              <small>${enumLabel("riskLevel", level)}</small>
            </button>`;
        })
        .join("");
      return `
        <div class="matrix-row">
          <strong>${enumLabel("probability", impact)}</strong>
          ${cells}
        </div>`;
    })
    .join("");
  return `
    <div class="matrix-card">
      <div class="matrix-header">
        <span>${t("page.impact")}</span>
        <span>${t("page.probability")}</span>
      </div>
      ${body}
    </div>`;
}

export function MonteCarloChart(simulation, t) {
  if (!simulation) {
    return EmptyState(t("empty.simulationTitle"), t("empty.simulationText"));
  }
  return `
    <div class="chart-panel">
      <div class="result-grid">
        ${StatCard({ label: t("metric.averageLoss"), value: formatCurrency(simulation.average_loss), accent: "teal" })}
        ${StatCard({ label: t("metric.medianLoss"), value: formatCurrency(simulation.median_loss), accent: "blue" })}
        ${StatCard({ label: t("metric.var95"), value: formatCurrency(simulation.var_95), accent: "orange" })}
        ${StatCard({ label: t("metric.var99"), value: formatCurrency(simulation.var_99), accent: "red" })}
      </div>
      ${renderHistogram(simulation.result_json?.histogram)}
    </div>`;
}

export function BayesianUpdatePanel(update, t) {
  if (!update) {
    return EmptyState(t("empty.bayesianTitle"), t("empty.bayesianText"));
  }
  return `
    <div class="bayesian-panel">
      <div class="result-grid">
        ${StatCard({ label: t("field.priorProbability"), value: `${(update.prior_probability * 100).toFixed(1)}%`, accent: "blue" })}
        ${StatCard({ label: t("field.posteriorProbability"), value: `${(update.posterior_probability * 100).toFixed(1)}%`, accent: "red" })}
      </div>
      <p>${update.explanation}</p>
    </div>`;
}

export function MitigationTable(items, t) {
  if (!items.length) {
    return EmptyState(t("empty.mitigationsTitle"), t("empty.mitigationsText"));
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("field.action")}</th>
            <th>${t("field.responsiblePerson")}</th>
            <th>${t("field.deadline")}</th>
            <th>${t("field.status")}</th>
            <th>${t("field.progress")}</th>
            <th>${t("field.residualRiskAfterAction")}</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr>
                  <td>${item.mitigation_action}</td>
                  <td>${item.responsible_person}</td>
                  <td>${item.deadline ? item.deadline.slice(0, 10) : "-"}</td>
                  <td><span class="status-pill">${enumLabel("mitigationStatus", item.status)}</span></td>
                  <td>${item.progress}%</td>
                  <td>${item.residual_risk_after_action}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

export function ReportCard(report, t) {
  return `
    <article class="entity-card compact">
      <div class="entity-card-head">
        <h3>${report.title}</h3>
        <span class="subtle-pill">${enumLabel("reportType", report.report_type)}</span>
      </div>
      <p>${report.executive_summary || t("common.reportSummaryPlaceholder")}</p>
      <div class="entity-meta">
        <span>${new Date(report.report_date).toLocaleDateString()}</span>
        <a href="/reports/${report.id}" data-link class="text-link">${t("button.view")}</a>
      </div>
    </article>`;
}

export function AuditLogTable(logs, t) {
  if (!logs.length) {
    return EmptyState(t("empty.auditTitle"), t("empty.auditText"));
  }
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("field.date")}</th>
            <th>${t("field.actor")}</th>
            <th>${t("field.action")}</th>
            <th>${t("field.entity")}</th>
            <th>${t("field.details")}</th>
          </tr>
        </thead>
        <tbody>
          ${logs
            .map(
              (log) => `
                <tr>
                  <td>${new Date(log.created_at).toLocaleString()}</td>
                  <td>${log.actor_email}</td>
                  <td>${log.action}</td>
                  <td>${log.entity_type} #${log.entity_id}</td>
                  <td>${Object.keys(log.details || {}).join(", ") || "-"}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

export function DashboardCharts({ distribution, trend, departments, histogram, t }) {
  return `
    <div class="chart-grid">
      <section class="panel">
        <h3>${t("chart.riskDistribution")}</h3>
        ${renderDonutChart(Object.entries(distribution || {}), ["#F04438", "#F79009", "#FACC15", "#12B76A"])}
      </section>
      <section class="panel">
        <h3>${t("chart.riskTrend")}</h3>
        ${renderLineChart(trend || [])}
      </section>
      <section class="panel">
        <h3>${t("chart.departmentComparison")}</h3>
        ${renderBarChart(Object.entries(departments || {}), "#0B2D4D")}
      </section>
      <section class="panel">
        <h3>${t("chart.lossDistribution")}</h3>
        ${renderHistogram(histogram)}
      </section>
    </div>`;
}
