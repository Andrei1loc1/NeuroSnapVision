<div align="center">

<img src="frontend/public/images/leaf.png" width="80" height="80" alt="NeuroSnap Vision" />

# NeuroSnap Vision

### Vârsta biologică, nu calorii. Aplicația care îți spune cât de bătrân e corpul tău — și ce să faci azi ca să încetinești ceasul.

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-frontend--six--phi--87.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-six-phi-87.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)]()
[![Made in Romania](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20in-Romania-0047AB?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/status-production--ready-22c55e?style=for-the-badge)]()

<sub>Aplicație web (PWA) de longevitate care combină viziunea artificială cu medicina longevității. Scanezi mâncarea cu camera telefonului, aplicația calculează vârsta biologică pe 7 dimensiuni, și un AI personalizat îți spune exact ce să faci azi ca să încetinești ritmul de îmbătrânire.</sub>

---

</div>

## ✨ Ce face

| 📸 | **Scanare AI a alimentelor** — Fotografiezi mâncarea → YOLO detectează regiunile → EfficientNet clasifică 270 tipuri de alimente → aplicația calculează calorii + macros. Selectezi porția, confirmi, masa se loghează automat. |
|:--:|:--|
| 🧬 | **Vârstă biologică pe 7 dimensiuni** — Estimare reală din datele tale: nutriție, somn, mișcare, sistem nervos, lumină, stare subiectivă, hormesis. Afișează trend pe 7/30/90/365 zile, vârsta organelor (creier, cardio, metabolic, imunitar) și punctul de maxim impact. |
| 🤖 | **Asistent AI cu context real** — Chat care știe vârsta ta biologică, scorurile pe dimensiuni, obiectivul tău. Răspunsuri ancorate în sens, nu în vinovăție. |
| 📊 | **Rapoarte săptămânale** — Calorii zilnice, balans macro, scor MIND (sănătate cerebrală), timing nutrițional, comparație săptămână-vs-săptămână, export CSV. |
| ⏰ | **Ritual zilnic cu streak-uri** — Check-in dimineața și seara (dispoziție, energie, stres, digestie, somn). Calendar de consecvență pe 35 zile. |
| 🔐 | **Jurnal criptat E2E** — Reflecții personale criptate AES-GCM client-side. Cheia nu părăsește device-ul tău. |
| ☀️ | **Fereastră solară/metabolică** — Calcul astronomic real pentru locația ta. Arată când metabolismul e la eficiență maximă. |
| 🧪 | **Experimente n=1** — Creează experimente personale cu durată, metrică urmărită, status. Aplicația calculează progresul automat. |
| 🌙 | **Zi de repaus digital** — Blochează aplicația în ziua aleasă pentru detox digital. |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 · **npm** ≥ 10 · **Python** 3.11+
- Cont **Prisma Accelerate** (gratuit) — [console.prisma.io](https://console.prisma.io)
- Cont **Ollama Cloud** (pentru AI chat) — [cloud.ollama.com](https://cloud.ollama.com)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local          # ← completează cu valorile tale
npx prisma generate
npx prisma db push                    # ← sincronizează schema
npm run dev                           # ← http://localhost:3000
```

### Backend

```bash
cd backend/hf-space
python -m venv venv
source venv/bin/activate             # ← pe Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                  # ← completează INTERNAL_API_TOKEN + ALLOWED_ORIGINS
uvicorn app:app --reload --port 8000
```

> ⚠️ Modelele ML (~310 MB: YOLO + EfficientNet + sklearn) trebuie descărcate separat în `backend/hf-space/models/`.

## 🛠️ Stack

<div align="center">

| | |
|:---|:---|
| **Frontend** | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · Prisma 7 · PWA |
| **Backend** | FastAPI · Python 3.11 · TensorFlow · Ultralytics YOLO · scikit-learn |
| **ML Models** | YOLO segmentation (52 MB) · EfficientNetB4 (240 MB) · MIND classifier (3.4 MB) |
| **AI Chat** | Ollama Cloud — `nemotron-3-ultra` |
| **Storage** | Prisma Accelerate (PostgreSQL) · Vercel Blob (imagini) · localStorage (cache) |
| **Deploy** | Vercel (frontend) · Hugging Face Space (backend) |

</div>

## ⚙️ Variabile de mediu

Toate sunt documentate în `.env.example` (frontend + backend). Cele **critice**:

| Variabilă | Unde | Scop |
|-----------|------|------|
| `DATABASE_URL` | Vercel | URL Prisma Accelerate (obligatoriu) |
| `SESSION_SECRET` | Vercel | Secret HMAC pentru sesiuni, min 32 bytes (obligatoriu) |
| `INTERNAL_API_TOKEN` | Vercel + HF Space | Shared secret frontend↔backend, **identic pe ambele** (obligatoriu) |
| `ALLOWED_ORIGINS` | HF Space | Originile frontend permise de CORS (obligatoriu) |
| `OLLAMA_CLOUD_API_KEY` | Vercel | Pentru AI chat |
| `YOLO_SPACE_URL` | Vercel | URL HF Space YOLO (fallback predict) |
| `CLASSIFIER_SPACE_URL` | Vercel | URL HF Space EfficientNet (fallback predict) |

> 💡 Generează secrete cu: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 🌍 Deploy

### Frontend → Vercel

1. Conectează repo în Vercel → **Root Directory**: `frontend`
2. Setează toate env vars din `.env.example`
3. Build command: `npm run build` (include `prisma generate`)
4. Auto-deploy pe push la `main`

### Backend → Hugging Face Space

1. Creează Docker Space pe [huggingface.co/new-space](https://huggingface.co/new-space)
2. Conținutul din `backend/hf-space/` e gata (Dockerfile + app.py + models/)
3. Setează în Space → Settings → Variables and secrets:
   - `INTERNAL_API_TOKEN` (aceeași valoare ca în Vercel)
   - `ALLOWED_ORIGINS` (URL-ul tău de producție + `http://localhost:3000`)
4. `git push hf main` sau Factory Reboot din UI

## 🔒 Securitate

- ✅ Sesiuni HMAC cu expirare 30 zile
- ✅ Backend protejat cu shared secret (`X-Internal-Token`)
- ✅ CORS restrictiv (doar originile din `ALLOWED_ORIGINS`)
- ✅ Validare input cu modele Pydantic pe toate rutele backend
- ✅ Rate limiting pe rutele costisitoare (`/predict`: 10 req/min)
- ✅ Nicio cheie API expusă client-side
- ✅ Error handling global cu JSON consistent, fără traceback în producție
- ✅ Jurnal criptat AES-GCM client-side (E2E)

## 📁 Structură

```
NeuroSnap Vision/
├── frontend/                  # Next.js 16 PWA
│   ├── app/                    # App Router + rute API (BFF proxy)
│   ├── components/             # Componente React pe funcționalități
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # API clients, auth, Prisma, cache
│   └── prisma/                 # Schema (18 modele)
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
├── MANUAL.md                   # Documentație tehnică completă
├── PLAN_PUBLICATION.md          # Plan de implementare (64 pași)
└── README.md                   # Acest fișier
```

## 📖 Documentație

- **[MANUAL.md](MANUAL.md)** — Documentație tehnică completă (arhitectură, rute API, modele ML, algoritmi de calcul, schema DB, flow-uri funcționale)
- **[PLAN_PUBLICATION.md](PLAN_PUBLICATION.md)** — Plan de implementare (64 pași, finalizat)
- **[frontend/README.md](frontend/README.md)** — Setup frontend + troubleshooting
- **[backend/README.md](backend/README.md)** — Setup backend + rute API + modele ML

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