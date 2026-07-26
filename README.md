<div align="center">

# 🧬 NeuroSnap Vision

### _Monitorizează-ți stilul de viață. Vârsta biologică nu minte._

**Aplicație PWA de longevitate care îți spune cât de bătrân e corpul tău cu adevărat — și ce să faci azi ca să încetinești ceasul.**

[![Live Demo](https://img.shields.io/badge/LIVE-frontend--six--phi--87.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-six-phi-87.vercel.app)
[![License](https://img.shields.io/badge/license-private-%23E4405F?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/status-production--ready-22c55e?style=for-the-badge&logo=checkmarx&logoColor=white)]()
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)]()
[![Made with](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20in%20Romania-0047AB?style=for-the-badge)]()

---

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" /> <img src="https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" /> <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" /> <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" /> <img src="https://img.shields.io/badge/YOLO-00FFFF?style=for-the-badge&logo=ultralytics&logoColor=black" /> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /> <img src="https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" /> <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />

</div>

---

## 🎯 Ce rezolvă

> **Problema:** Aplicațiile de sănătate îți arată calorii. Dar caloriile nu spun dacă corpul tău îmbătrânește mai repede decât ar trebui.

**NeuroSnap Vision** combină viziunea artificială cu medicina longevității. Scanezi mâncarea cu camera telefonului, aplicația calculează vârsta biologică pe 7 dimensiuni, și un AI personalizat îți spune exact ce să faci azi ca să încetinești ritmul de îmbătrânire.

---

## ✨ Funcționalități

<table>
<tr>
<td width="50%">

### 📸 Scanare AI a alimentelor
Fotografiezi mâncarea → **YOLO** detectează regiunile → **EfficientNet** clasifică 270 de tipuri de alimente → aplicația calculează calorii + macros. Selectezi porția, confirmi, masa se loghează automat.

### 🧬 Vârstă biologică pe 7 dimensiuni
Estimare reală din datele tale: nutriție, somn, mișcare, sistem nervos, lumină, stare subiectivă, hormesis. Afișează trend pe 7/30/90/365 zile, vârsta organelor (creier, cardio, metabolic, imunitar) și **punctul de maxim impact**.

### 📊 Rapoarte săptămânale
Calorii zilnice, balans macro, scor MIND (sănătate cerebrală), timing nutrițional, comparație săptămână-vs-săptămână, export CSV.

### 🤖 Asistent AI cu context real
Chat care știe vârsta ta biologică, scorurile pe dimensiuni, obiectivul tău. Răspunsuri ancorate în sens, nu în vinovăție.

</td>
<td width="50%">

### ⏰ Ritual zilnic cu streak-uri
Check-in dimineața și seara (dispoziție, energie, stres, digestie, somn). Calendar de consecvență pe 35 zile.

### 🔐 Jurnal criptat E2E
Reflecții personale criptate **AES-GCM** client-side. Cheia nu părăsește device-ul tău.

### ☀️ Fereastră solară/metabolică
Calcul astronomic real pentru locația ta. Arată când metabolismul e la eficiență maximă.

### 🧪 Experimente n=1
Creează experimente personale cu durată, metrică urmărită, status. Aplicația calculează progresul automat.

### 🌙 Zi de repaus digital (Sabbath)
Blochează aplicația în ziua aleasă pentru detox digital.

</td>
</tr>
</table>

---

## 🏗️ Arhitectură

```
                    ┌─────────────────────────────────────────────────┐
                    │              User Browser (PWA)                 │
                    │         installabilă pe iOS / Android             │
                    └───────────────────────┬─────────────────────────┘
                                            │
                    ┌───────────────────────▼─────────────────────────┐
                    │           Vercel — Next.js 16 PWA               │
                    │     App Router + BFF (rute API interne proxy)    │
                    │                                                 │
                    │  • Auth (HMAC sessions, 30 zile)                │
                    │  • Prisma Accelerate (PostgreSQL)               │
                    │  • Vercel Blob (imagini)                        │
                    │  • Sentry (error monitoring)                    │
                    │  • Tailwind CSS v4 + Shadcn UI                  │
                    └───────┬───────────────────┬─────────────────────┘
                            │                   │
            ┌───────────────▼───────┐   ┌───────▼───────────────┐
            │  Hugging Face Space   │   │   Ollama Cloud        │
            │  FastAPI Python 3.11  │   │   (LLM pentru AI Chat) │
            │                       │   └────────────────────────┘
            │  • YOLO segmentation   │
            │  • EfficientNet B4     │
            │  • scikit-learn (MIND) │
            │  • Multi-agent RL      │
            │  • Bio-age engine      │
            │  • Rate limiting       │
            │  • Shared secret auth  │
            └───────────────────────┘
```

---

## 🚀 Rulează local

### Prerequisites

| Necesar | Versiune | Link |
|---------|----------|------|
| Node.js | ≥ 18 | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Prisma Accelerate | gratuit | https://console.prisma.io |
| Ollama Cloud | pentru AI chat | https://cloud.ollama.com |

### 1️⃣ Frontend

```bash
cd frontend
npm install
cp .env.example .env.local          # ← completează cu valorile tale
npx prisma generate
npx prisma db push                   # ← sincronizează schema cu DB-ul
npm run dev                          # ← http://localhost:3000
```

### 2️⃣ Backend

```bash
cd backend/hf-space
python -m venv venv
source venv/bin/activate             # ← pe Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # ← completează INTERNAL_API_TOKEN + ALLOWED_ORIGINS
uvicorn app:app --reload --port 8000
```

> ⚠️ Modelele ML (~310 MB: YOLO + EfficientNet + sklearn) trebuie descărcate separat în `backend/hf-space/models/`.

---

## 🔧 Variabile de mediu

Toate sunt documentate în `.env.example` (frontend + backend). Cele **critice**:

| Variabilă | Unde | Scop |
|-----------|------|------|
| `DATABASE_URL` | Vercel | URL Prisma Accelerate (obligatoriu) |
| `SESSION_SECRET` | Vercel | Secret HMAC pentru sesiuni, min 32 bytes (obligatoriu) |
| `INTERNAL_API_TOKEN` | Vercel + HF Space | Shared secret frontend↔backend, **identic pe ambele** (obligatoriu) |
| `ALLOWED_ORIGINS` | HF Space | Originile frontend permise de CORS (obligatoriu) |
| `OLLAMA_CLOUD_API_KEY` | Vercel | Pentru AI chat (obligatoriu pentru chat) |
| `YOLO_SPACE_URL` | Vercel | URL HF Space YOLO (fallback predict) |
| `CLASSIFIER_SPACE_URL` | Vercel | URL HF Space EfficientNet (fallback predict) |

> 💡 Generează secrete cu: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 🌍 Deploy

### Frontend → Vercel

1. Conectează repo `github.com/Andrei1loc1/NeuroSnapVision` în Vercel
2. **Root Directory**: `frontend`
3. Setează toate env vars (vezi `.env.example`)
4. Build command: `npm run build` (include `prisma generate`)
5. Auto-deploy pe push la `main`

### Backend → Hugging Face Space

1. Creează Docker Space pe https://huggingface.co/new-space
2. Conținutul din `backend/hf-space/` e gata (Dockerfile + app.py + models/)
3. Setează în Space → Settings → Variables and secrets:
   - `INTERNAL_API_TOKEN` (aceeași valoare ca în Vercel)
   - `ALLOWED_ORIGINS` (URL-ul tău de producție + `http://localhost:3000`)
4. `git push hf main` sau Factory Reboot din UI

---

## 🔒 Securitate

| Măsură | Implementare |
|--------|--------------|
| **Sesiuni** | HMAC-signed, expiră în 30 zile, `SESSION_SECRET` obligatoriu |
| **Backend auth** | Shared secret `X-Internal-Token` — refuză request-uri fără token |
| **CORS** | Restrictiv — doar originile din `ALLOWED_ORIGINS` |
| **Validare input** | Modele Pydantic pe toate rutele POST → 422 pe invalid |
| **Rate limiting** | slowapi — `/predict` 10 req/min, alte rute 60-120 req/min |
| **Error handling** | Global, JSON consistent, fără traceback în producție |
| **Secrete** | Toate env vars server-only, niciuna expusă client-side |
| **Jurnal E2E** | Criptare AES-GCM client-side, cheia nu părăsește device-ul |

---

## 📁 Structură

```
NeuroSnap Vision/
├── frontend/                  # Next.js 16 PWA
│   ├── app/                    # App Router + rute API (BFF)
│   ├── components/             # Componente React organizate pe funcționalități
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API clients, session, Prisma, server env
│   ├── prisma/                 # Schema + migrări
│   └── public/                 # Manifest PWA, service worker, imagini
├── backend/
│   ├── hf-space/               # FastAPI (singura sursă backend)
│   │   ├── app.py              # Entry point (lazy loading)
│   │   ├── schemas.py          # Modele Pydantic
│   │   ├── services/           # 11 servicii business logic
│   │   ├── agents/             # Multi-agent Q-learning
│   │   ├── models/              # ML models (~310 MB)
│   │   └── Dockerfile          # Deploy HF Space
│   ├── gradio-space/            # Fallback Gradio (clasificare)
│   └── yolo-space/              # Fallback Gradio (detecție YOLO)
├── PLAN_PUBLICATION.md          # Plan de implementare (64 pași)
└── README.md                   # Acest fișier
```

---

## 🧠 Modele ML

| Model | Fișier | Dimensiune | Scop |
|-------|--------|-----------|------|
| **YOLO segmentation** | `yolo_foodseg_best.pt` | 52 MB | Detectează regiunile alimentare din imagine |
| **EfficientNet B4** | `nutritrack_B4_SUPREM.keras` | 240 MB | Clasifică 270 tipuri de alimente |
| **MIND classifier** | `mind_pattern_model.pkl` | 3.4 MB | Clasifică pattern-ul dietei (MIND diet) |
| **Q-Tables** | `multi_agent_q_tables.json` | — | 5 agenți Q-learning pentru recomandări |

---

## 🗺️ Roadmap

- [x] Scanare AI alimente (YOLO + EfficientNet)
- [x] Vârstă biologică pe 7 dimensiuni
- [x] Rapoarte săptămânale cu comparații
- [x] Asistent AI cu context real
- [x] Ritual zilnic cu streak-uri
- [x] Jurnal criptat E2E
- [x] Experimente n=1
- [x] Fereastră solară
- [x] Zi de repaus digital
- [ ] Integrare dispozitive wearable (Apple Health, Garmin)
- [ ] Comunitate + challenges
- [ ] Dark mode
- [ ] Suport multi-language (EN/RO)

---

<div align="center">

## 🌐 Socials

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=Instagram&logoColor=white)](https://www.instagram.com/andreichindris17/) [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andrei-chindri%C8%99-97b931382/) [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:chindrisandrei2005@gmail.com)

---

### ✍️ Random Dev Quote

![](https://quotes-github-readme.vercel.app/api?type=horizontal&theme=radical)

---

[![](https://visitcount.itsvg.in/api?id=Andrei1loc1&icon=0&color=0)](https://visitcount.itsvg.in)

</div>

<!-- Built with ❤️ in Romania -->