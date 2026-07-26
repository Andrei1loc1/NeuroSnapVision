# NeuroSnap Vision — Frontend

Acest director conține implementarea componentei frontend a aplicației **NeuroSnap Vision**, o platformă de monitorizare nutrițională bazată pe viziune artificială. Frontend-ul este dezvoltat în **Next.js 16** (App Router) cu suport PWA și funcționează conform arhitecturii **Backend-for-Frontend (BFF)**, gestionând atât interfața utilizator, cât și rutele API interne de proxy către backend-ul Python.

## Tehnologii de bază

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** și **Shadcn UI** (Radix) pentru stilizare
- **Prisma 7** (Prisma Accelerate) + **PostgreSQL** pentru persistența datelor
- **@vercel/blob** pentru upload imagini
- **Recharts** pentru vizualizarea datelor nutriționale
- **Sentry** (opțional, via `@sentry/nextjs`) pentru monitorizare erori

## Funcționalități principale

- **Scanare AI alimentară** — captură foto și clasificare automată a preparatelor (proxy către backend Python)
- **Jurnal zilnic** — evidența meselor cu totaluri calorice și macronutrienți
- **Dashboard** — inel caloric, distribuție macro, scoruri AI
- **Rapoarte lunare** — agregare vizuală cu export CSV
- **Onboarding** — calcul automat BMR/TDEE și targeturi personalizate
- **Bio Age / Protocol / HRV / Allostatic / Circadian / Sabbath** — module de longevitate

## Prerequisites

- **Node.js ≥ 18** (recomandat 20+)
- **npm ≥ 10**
- **PostgreSQL** accesibil via **Prisma Accelerate** (sau instanță locală)
- Cont **Vercel** cu integrarea **Vercel Blob** activată (pentru imagini)
- Cont **Ollama Cloud** (pentru AI Chat)
- Backend-ul Python pornit local sau un `BACKEND_URL` către un HF Space (vezi [`../backend/README.md`](../backend/README.md))

## Setup dev

```bash
cd frontend
npm install
cp .env.example .env.local   # apoi completează valorile reale
npx prisma generate
npx prisma db push            # sau: npx prisma migrate dev
npm run dev
```

Serverul de dezvoltare pornește la `http://localhost:3000`.

> Variabilele server-only sunt validate în `lib/server/env.ts` și nu sunt expuse browser-ului.

## Build

```bash
npm run build
```

Scriptul `build` rulează automat `prisma generate` înainte de `next build` (vezi `package.json`).

## Deploy Vercel

1. **Connect repo** — importă `github.com/Andrei1loc1/NeuroSnapVision` în Vercel (New Project → Import Git Repository).
2. **Set env vars** — în Project Settings → Environment Variables adaugă toate variabilele din tabelul de mai jos (pentru Production, Preview și Development după caz).
3. **Integrări** — asigură-te că integrarea **Vercel Blob** este activă; `BLOB_READ_WRITE_TOKEN` se completează automat din integrare.
4. **Auto-deploy** — orice push pe ramura `main` declanșează build + deploy în producție. Pull requests creează Preview Deployments.
5. **Sentry (opțional)** — pentru monitorizare erori în producție setează `NEXT_PUBLIC_SENTRY_DSN` (client) și/sau `SENTRY_DSN` (server), apoi decomentează wrapper-ul `withSentryConfig` în `next.config.ts` și instalează `@sentry/nextjs`.

## PWA config

Aplicația este installabilă ca PWA. Configurația relevantă:

- `public/manifest.json` — manifestul aplicației (name, short_name, theme_color, icons)
- `public/sw.js` — Service Worker pentru caching offline
- **Icon-uri necesare** (în `public/` sau `public/images/`):
  - `icon-192.png` (192×192)
  - `icon-512.png` (512×512)
  - `apple-touch-icon.png` (180×180)
- Înregistrarea SW se face în `app/layout.tsx` (sau echivalent). Verifică că manifestul referențiază corect icon-urile.

## Variabile de mediu

Toate variabilele server-only sunt definite în `lib/server/env.ts` și nu sunt expuse browser-ului. Copiază `.env.example` în `.env.local` și completează valorile reale.

| Variabilă | Scope | Secret | Descriere |
|-----------|-------|--------|-----------|
| `DATABASE_URL` | server-only | da | Prisma Accelerate URL (`prisma://accelerate.prisma-data.net/...`) |
| `SESSION_SECRET` | server-only | da | Cheie HMAC pentru semnarea sesiunilor (min 32 bytes) |
| `BACKEND_URL` | server-only | nu | URL backend Python (default `http://127.0.0.1:8000`) |
| `INTERNAL_API_TOKEN` | server-only | da | Shared secret cu backend, trimis ca header `X-Internal-Token` |
| `OLLAMA_CLOUD_URL` | server-only | nu | URL Ollama (default `http://localhost:11434`) |
| `OLLAMA_MODEL` | server-only | nu | Model LLM (default `nemotron-3-ultra:cloud`) |
| `OLLAMA_CLOUD_API_KEY` | server-only | da | Cheie API Ollama |
| `BLOB_READ_WRITE_TOKEN` | server-only | da | Token Vercel Blob pentru upload imagini |
| `NEXT_PUBLIC_SITE_URL` | public | nu | URL public folosit de `sitemap.ts` / `robots.ts` |
| `NEXT_PUBLIC_SENTRY_DSN` | public | nu | DSN Sentry pentru erorile client (activează `sentry.client.config.ts`) |
| `SENTRY_DSN` | server-only | nu | DSN Sentry pentru erorile server/edge (opțional, fallback la `NEXT_PUBLIC_SENTRY_DSN`) |
| `SENTRY_ORG` | server-only | nu | Organizația Sentry (necesar doar dacă wrapper-ul `withSentryConfig` e activ) |
| `SENTRY_PROJECT` | server-only | nu | Proiectul Sentry |
| `SENTRY_AUTH_TOKEN` | server-only (CI) | da | Token pentru upload source maps în CI (doar la build) |

> **Notă:** `NEXT_PUBLIC_BACKEND_URL` a fost eliminat în Pas 0.4 — folosește `BACKEND_URL`. Nu există `AI_BACKEND_URL`.

## Structura proiectului

```
frontend/
├── app/         # Next.js App Router + rute API interne (BFF)
├── components/  # Componente React organizate pe funcționalități
├── hooks/       # Custom React hooks
├── lib/         # API clients, logică business, server env, session, prisma
├── prisma/      # Schema și migrări bază de date
├── public/      # Asset-uri statice, manifest PWA, service worker
├── utils/       # Utilitare
├── docs/        # Documentație internă
├── middleware.ts              # Middleware Next.js (auth/guard)
├── next.config.ts             # Config Next.js (+ wrapper Sentry comentat)
├── sentry.client.config.ts    # Sentry client init
├── sentry.server.config.ts    # Sentry server init
├── sentry.edge.config.ts      # Sentry edge init
└── prisma.config.ts           # Config Prisma (Accelerate)
```

## Autentificare

Flux lightweight header-based: utilizatorul se înregistrează cu un nume, identificatorul este persistat în `localStorage`, iar toate cererile API includ header-ul `X-User-ID`. Sesiunile sunt semnate HMAC cu `SESSION_SECRET`. Prisma filtrează datele per-utilizator la nivel de interogare.

## Troubleshooting

| Simptom | Cauză probabilă | Soluție |
|---------|-----------------|---------|
| În header apare „Utilizator" în loc de nume | `localStorage` gol pe un domain nou (fără onboarding) | Fă onboarding-ul complet din UI (setează numele utilizatorului) — datele se scriu în `localStorage` |
| Build fail la `prisma generate` | `DATABASE_URL` lipsă sau invalid | Verifică `DATABASE_URL` în `.env.local` și rulează `npx prisma generate` separat pentru a vedea eroarea |
| Predict nu funcționează (eroare backend) | `BACKEND_URL` greșit sau `INTERNAL_API_TOKEN` neconfigurat | Verifică `BACKEND_URL` pointează către backend-ul Python pornit; asigură-te că `INTERNAL_API_TOKEN` are aceeași valoare în frontend și backend |
| AI Chat nu răspunde | `OLLAMA_CLOUD_URL` / `OLLAMA_CLOUD_API_KEY` lipsă | Verifică `OLLAMA_CLOUD_URL` și `OLLAMA_CLOUD_API_KEY` în `.env.local`; testarea conectivității se face server-side |
| Imaginile nu se încarcă | `BLOB_READ_WRITE_TOKEN` lipsă sau integrarea Vercel Blob inactivă | Activează integrarea Vercel Blob în dashboard-ul Vercel și re-setează token-ul |
| Sentry nu trimite evenimente | DSN-urile nu sunt setate | Setează `NEXT_PUBLIC_SENTRY_DSN` (și opțional `SENTRY_DSN`); decomentează wrapper-ul în `next.config.ts` |
| Erori de tip CORS în browser | Frontend pe alt domeniu decât cel permis în backend | Adaugă originea frontend în `ALLOWED_ORIGINS` din backend |

## Deploy

Deploy pe **Vercel** — push pe ramura `main` declanșează build-ul automat. Configurează variabilele de mediu în dashboard-ul Vercel (Project Settings → Environment Variables). Pentru imagini, setează `BLOB_READ_WRITE_TOKEN` din integrarea Vercel Blob. Vezi secțiunea [Deploy Vercel](#deploy-vercel) de mai sus.