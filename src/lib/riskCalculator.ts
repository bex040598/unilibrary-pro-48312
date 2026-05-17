import { RiskInput, RiskLevel, RiskResult } from "../types";

export function calculateRisk(input: RiskInput): RiskResult {
  const rawScore =
    input.threatProbability *
    input.vulnerabilityLevel *
    input.impactValue *
    input.controlWeakness *
    100;

  const score = Math.round(rawScore);

  if (score <= 24) {
    return {
      score,
      level: "Past",
      color: "green",
      description:
        "Risk darajasi past. Mavjud nazorat choralari yetarli, ammo doimiy monitoring tavsiya etiladi.",
    };
  }

  if (score <= 49) {
    return {
      score,
      level: "O'rta",
      color: "yellow",
      description:
        "Risk darajasi o'rta. Qo'shimcha nazorat choralari va zaifliklarni kamaytirish talab etiladi.",
    };
  }

  if (score <= 74) {
    return {
      score,
      level: "Yuqori",
      color: "orange",
      description: "Risk darajasi yuqori. Tezkor mitigatsiya rejasi ishlab chiqilishi kerak.",
    };
  }

  return {
    score,
    level: "Kritik",
    color: "red",
    description:
      "Risk darajasi kritik. Zudlik bilan xavfsizlik choralarini kuchaytirish va rahbariyatga xabar berish zarur.",
  };
}

export function getRiskLevelDescription(level: RiskLevel) {
  switch (level) {
    case "Past":
      return "Nazoratlar yetarli, monitoring davom etadi.";
    case "O'rta":
      return "Zaiflikni kamaytirish va siyosatlarni kuchaytirish kerak.";
    case "Yuqori":
      return "Tezkor mitigatsiya va boshqaruv e'tibori talab qilinadi.";
    case "Kritik":
      return "Zudlik bilan choralar va rahbariyat eskalatsiyasi talab qilinadi.";
  }
}

export function scoreToProbabilityRank(probability: number) {
  if (probability <= 0.1) return 1;
  if (probability <= 0.3) return 2;
  if (probability <= 0.5) return 3;
  if (probability <= 0.7) return 4;
  return 5;
}

export function scoreToImpactRank(impactValue: number) {
  if (impactValue <= 0.2) return 1;
  if (impactValue <= 0.4) return 2;
  if (impactValue <= 0.6) return 3;
  if (impactValue <= 0.8) return 4;
  return 5;
}
