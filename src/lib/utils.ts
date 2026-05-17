import { clsx } from "clsx";
import { Asset, RiskLevel } from "../types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getAssetImpactAverage(asset: Asset) {
  return Number(
    ((asset.confidentialityScore + asset.integrityScore + asset.availabilityScore) / 3).toFixed(2),
  );
}

export function getAssetImpactValue(asset: Asset) {
  return Number((getAssetImpactAverage(asset) / 5).toFixed(2));
}

export function riskLevelColor(level: RiskLevel) {
  switch (level) {
    case "Past":
      return "var(--green)";
    case "O'rta":
      return "var(--yellow)";
    case "Yuqori":
      return "var(--orange)";
    case "Kritik":
      return "var(--red)";
    default:
      return "var(--blue)";
  }
}

export function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
