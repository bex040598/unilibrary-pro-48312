export type RiskLevel = "Past" | "O'rta" | "Yuqori" | "Kritik";
export type EntityStatus = "Active" | "Inactive" | "Under Review";
export type UserRole =
  | "Super Admin"
  | "Kiberxavfsizlik Analitigi"
  | "Auditor"
  | "Tashkilot foydalanuvchisi";

export interface Asset {
  id: string;
  assetName: string;
  assetType: string;
  organization: string;
  owner: string;
  criticality: RiskLevel;
  confidentialityScore: number;
  integrityScore: number;
  availabilityScore: number;
  businessImpact: string;
  status: EntityStatus;
  createdAt: string;
}

export interface Threat {
  id: string;
  threatName: string;
  category: string;
  description: string;
  probability: number;
  source: "Internal" | "External" | "Hybrid";
  severity: RiskLevel;
  createdAt: string;
}

export interface Vulnerability {
  id: string;
  vulnerabilityName: string;
  category: string;
  cveId?: string;
  description: string;
  severityLevel: RiskLevel;
  severityScore: number;
  affectedAsset: string;
  detectionMethod: string;
  createdAt: string;
}

export interface SecurityControl {
  id: string;
  controlName: string;
  framework: string;
  controlType: string;
  description: string;
  effectivenessLevel: "Juda kuchli" | "Kuchli" | "O'rta" | "Zaif" | "Mavjud emas";
  effectivenessScore: number;
  implementationStatus: "Implemented" | "Partially Implemented" | "Not Implemented";
  owner: string;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  assetId: string;
  threatId: string;
  vulnerabilityId: string;
  controlId: string;
  threatProbability: number;
  vulnerabilityLevel: number;
  impactValue: number;
  controlWeakness: number;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendations: string[];
  assessedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  status: "Success" | "Failed";
  createdAt: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization: string;
  status: "Active" | "Suspended";
  createdAt: string;
  password: string;
}

export interface ReportRecord {
  id: string;
  organization: string;
  fromDate: string;
  toDate: string;
  riskLevel: RiskLevel | "Barchasi";
  format: "PDF" | "DOCX" | "XLSX";
  generatedBy: string;
  createdAt: string;
  itemCount: number;
  summary: string;
}

export interface PlatformSettings {
  defaultOrganization: string;
  preferredFramework: string;
  reportOwner: string;
  enableEmailAlerts: boolean;
  enablePrintBranding: boolean;
  riskThresholds: {
    lowMax: number;
    mediumMax: number;
    highMax: number;
  };
}

export interface RiskInput {
  threatProbability: number;
  vulnerabilityLevel: number;
  impactValue: number;
  controlWeakness: number;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  color: string;
  description: string;
}
