import { RiskLevel } from "../../types";
import { Badge } from "../ui/Badge";

const variants: Record<RiskLevel, "green" | "yellow" | "orange" | "red"> = {
  Past: "green",
  "O'rta": "yellow",
  Yuqori: "orange",
  Kritik: "red",
};

export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return <Badge variant={variants[level]}>{level}</Badge>;
}
