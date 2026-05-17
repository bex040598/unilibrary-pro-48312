function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export function renderDonutChart(entries = [], colors = []) {
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0) || 1;
  let angle = 0;
  const arcs = entries
    .map(([label, value], index) => {
      const segment = (Number(value || 0) / total) * 360;
      const path = arcPath(110, 110, 78, angle, angle + segment);
      const color = colors[index % colors.length];
      angle += segment;
      return `<path d="${path}" stroke="${color}" stroke-width="28" fill="none" stroke-linecap="round"></path>`;
    })
    .join("");

  const legend = entries
    .map(
      ([label, value], index) => `
        <li class="chart-legend-item">
          <span class="chart-dot" style="background:${colors[index % colors.length]}"></span>
          <span>${label}</span>
          <strong>${value}</strong>
        </li>`
    )
    .join("");

  return `
    <div class="chart-block">
      <svg viewBox="0 0 220 220" class="donut-chart" role="img" aria-label="donut chart">
        <circle cx="110" cy="110" r="78" fill="none" stroke="#e7eef7" stroke-width="28"></circle>
        ${arcs}
        <text x="110" y="104" text-anchor="middle" class="donut-total">${total}</text>
        <text x="110" y="126" text-anchor="middle" class="donut-label">total</text>
      </svg>
      <ul class="chart-legend">${legend}</ul>
    </div>`;
}

export function renderBarChart(entries = [], color = "#1E5AA8") {
  const max = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);
  const bars = entries
    .map(([label, value]) => {
      const size = Math.max((Number(value || 0) / max) * 100, 4);
      return `
        <div class="bar-row">
          <div class="bar-label">${label}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${size}%; background:${color}"></div>
          </div>
          <strong>${Number(value || 0).toFixed(0)}</strong>
        </div>`;
    })
    .join("");
  return `<div class="bar-chart">${bars}</div>`;
}

export function renderLineChart(entries = [], stroke = "#0E9F9A") {
  const points = entries.length ? entries : [{ month: "N/A", average_residual: 0 }];
  const max = Math.max(...points.map((item) => Number(item.average_residual || 0)), 1);
  const width = 500;
  const height = 220;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const polyline = points
    .map((item, index) => {
      const x = index * step;
      const y = height - (Number(item.average_residual || 0) / max) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");
  const labels = points
    .map(
      (item, index) => `
        <text x="${index * step}" y="${height}" class="line-label">${item.month}</text>`
    )
    .join("");
  return `
    <svg viewBox="0 0 ${width} ${height + 20}" class="line-chart" role="img" aria-label="line chart">
      <polyline points="${polyline}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"></polyline>
      ${labels}
    </svg>`;
}

export function renderHistogram(histogram) {
  const counts = histogram?.counts || [];
  const edges = histogram?.edges || [];
  const max = Math.max(...counts, 1);
  return `
    <div class="histogram">
      ${counts
        .map((count, index) => {
          const height = Math.max((count / max) * 100, 8);
          const label = edges[index] ?? index;
          return `
            <div class="histogram-bar">
              <div class="histogram-column" style="height:${height}%"></div>
              <span>${Number(label).toFixed(0)}</span>
            </div>`;
        })
        .join("")}
    </div>`;
}
