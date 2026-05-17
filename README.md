# CyberRisk Probability Assessment Platform

Raqamli tizimlarda kiberxavfsizlik risklarini ehtimollik asosida baholashga mo'ljallangan professional frontend MVP platforma. Loyiha magistrlik dissertatsiyasi, ilmiy-amaliy tadqiqot va tashkilotlar uchun enterprise uslubdagi cybersecurity risk management dashboard ko'rinishida tayyorlandi.

## Asosiy maqsad

Platforma quyidagi vazifalarni bajaradi:

- raqamli aktivlar inventarini yuritadi
- tahdidlar, zaifliklar va nazorat choralarini boshqaradi
- riskni ehtimollik asosida real-time hisoblaydi
- risk matritsa va heatmap ko'rsatadi
- tavsiyalar generatsiya qiladi
- audit log va hisobot preview yuritadi

## Risk formulasi

```text
Risk Score = Threat Probability x Vulnerability Level x Impact Value x Control Weakness x 100
```

Bu yerda:

- `P(T)` = tahdid ehtimolligi
- `V` = zaiflik darajasi
- `I` = aktivning ta'sir qiymati
- `C` = nazorat zaifligi koeffitsiyenti

Risk darajalari:

- `0-24` = Past
- `25-49` = O'rta
- `50-74` = Yuqori
- `75-100` = Kritik

## Texnologiyalar

### Frontend MVP

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- localStorage-based mock persistence

### Backend-ready architecture

- REST API endpoint katalogi `src/lib/api.ts` da tayyor
- JWT/RBAC session modeli `src/lib/auth.ts` da tayyor
- eski FastAPI prototipi `backend/` papkasida saqlangan
- Render blueprint `render.yaml` orqali frontend + backend + database uchun moslangan

## Demo loginlar

- `admin@cyberrisk.uz / Admin123!`
- `analyst@cyberrisk.uz / Analyst123!`
- `auditor@cyberrisk.uz / Auditor123!`
- `user@cyberrisk.uz / User123!`

## Sahifalar

- `/login`
- `/dashboard`
- `/assets`
- `/threats`
- `/vulnerabilities`
- `/controls`
- `/risk-assessment`
- `/risk-matrix`
- `/heatmap`
- `/recommendations`
- `/reports`
- `/audit-logs`
- `/users`
- `/settings`

## Ishga tushirish

### 1. Dependency o'rnatish

```bash
npm install
```

### 2. Development server

```bash
npm run dev
```

Frontend odatda shu manzilda ochiladi:

`http://localhost:5173`

### 3. Type check

```bash
npm run typecheck
```

### 4. Production build

```bash
npm run build
```

### 5. Production preview / static start

```bash
npm run start
```

Default preview port:

`http://localhost:4173`

## Project structure

```text
src/
  app/
    dashboard/
    assets/
    threats/
    vulnerabilities/
    controls/
    risk-assessment/
    risk-matrix/
    heatmap/
    recommendations/
    reports/
    audit-logs/
    users/
    settings/
    login/
  components/
    layout/
    dashboard/
    assets/
    threats/
    vulnerabilities/
    controls/
    risk/
    reports/
    ui/
  lib/
    api.ts
    auth.ts
    mockData.ts
    platform-context.tsx
    recommendationEngine.ts
    riskCalculator.ts
    utils.ts
  types/
```

## MVP imkoniyatlari

- responsive enterprise dashboard
- aktivlar CRUD
- tahdidlar CRUD
- zaifliklar CRUD
- nazorat choralari CRUD
- risk assessment form
- real-time risk calculation engine
- risk gauge
- risk matrix
- risk heatmap
- tavsiya generatsiyasi
- audit log mock
- hisobot preview va eksport
- localStorage persistence

## Render deploy

Repo Render'ga ulanganda `render.yaml` quyidagilarni provision qiladi:

- `cyberrisk-probability-api-bex040598` - Python backend service
- `cyberrisk-probability-web-bex040598` - static frontend
- `cyberrisk-probability-db-bex040598` - PostgreSQL

Frontend static publish path:

`dist`

## Environment variables

`.env.example` fayl ichida:

```bash
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api
```

## Keyingi bosqich tavsiyasi

- Express.js yoki Next API Routes bilan real backend qo'shish
- Prisma + PostgreSQL ulash
- haqiqiy JWT auth va bcrypt hashing
- rate limiting va validation middleware
- PDF/DOCX/XLSX exportni server tomonga ko'chirish
- SIEM/CVE intelligence integratsiya placeholderlarini real servisga ulash
