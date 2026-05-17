export function generateRecommendation(riskLevel: string, threatCategory: string): string[] {
  const recommendations: string[] = [];

  if (riskLevel === "Kritik") {
    recommendations.push("Zudlik bilan tizimga kirish huquqlarini qayta ko'rib chiqing.");
    recommendations.push(
      "Zaiflikni bartaraf etish uchun patch yoki konfiguratsiya yangilanishini amalga oshiring.",
    );
    recommendations.push("SIEM monitoring va real-time alerting tizimini yoqing.");
    recommendations.push("Rahbariyat va xavfsizlik guruhiga tezkor xabar yuboring.");
  }

  if (riskLevel === "Yuqori") {
    recommendations.push("Qo'shimcha autentifikatsiya va avtorizatsiya nazoratlarini joriy qiling.");
    recommendations.push("Zaiflik skanerini ishga tushiring va natijalarni qayta baholang.");
    recommendations.push("Firewall, WAF yoki IDS/IPS qoidalarini yangilang.");
  }

  if (riskLevel === "O'rta") {
    recommendations.push("Xavfsizlik siyosatini qayta ko'rib chiqing.");
    recommendations.push("Xodimlar uchun kiberxavfsizlik bo'yicha trening tashkil qiling.");
    recommendations.push("Log monitoring va davriy auditni yo'lga qo'ying.");
  }

  if (riskLevel === "Past") {
    recommendations.push("Mavjud nazorat choralarini saqlab boring.");
    recommendations.push("Davriy monitoring va auditni davom ettiring.");
  }

  if (threatCategory === "Phishing") {
    recommendations.push("Anti-phishing trening va email filtering tizimini kuchaytiring.");
  }

  if (threatCategory === "SQL Injection") {
    recommendations.push("Parameterized queries, ORM va input validation mexanizmlaridan foydalaning.");
  }

  if (threatCategory === "DDoS") {
    recommendations.push("Rate limiting, CDN va DDoS protection xizmatlarini yoqing.");
  }

  if (threatCategory === "Malware" || threatCategory === "Ransomware") {
    recommendations.push("Endpoint protection, backup va malware scanning tizimlarini kuchaytiring.");
  }

  if (threatCategory === "Unauthorized Access") {
    recommendations.push("RBAC, MFA va session monitoring mexanizmlarini kuchaytiring.");
  }

  if (threatCategory === "Data Leakage") {
    recommendations.push("Data encryption, DLP va access control siyosatini joriy qiling.");
  }

  return Array.from(new Set(recommendations));
}
