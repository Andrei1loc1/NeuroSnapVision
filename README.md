# NeuroSnap Vision

Platformă de monitorizare nutrițională bazată pe **viziune artificială** și **vârstă biologică**. Frontend-ul este un **Next.js 16 PWA** (deploy pe Vercel) care comunică cu un backend **FastAPI Python** (deploy pe Hugging Face Space) ce expune modele ML de clasificare a alimentelor (**YOLO segmentation** + **EfficientNet**) și un chat AI (**Ollama Cloud**).

## Arhitectură

```
[User Browser] → [Vercel: Next.js PWA] → [HF Space: FastAPI Backend]
                     ↓                          ↓
                [Prisma Accelerate]      [ML Models: YOLO + EfficientNet]
                [PostgreSQL]            [Ollama Cloud: AI Chat]
                [Vercel Blob: Images]
```

- **Frontend** (`frontend/`) — Next.js 16 App Router, PWA, arhitectură Backend-for-Frontend: găzduiește și rutele API interne de proxy către backend-ul Python. Persistă starea în PostgreSQL via **Prisma Accelerate** și imaginile în **Vercel Blob**.
- **Backend** (`backend/hf-space/`) — FastAPI stateless. Expune inferență ML: segmentare/clasificare alimente, scor sănătate, scor MIND, recomandări multi-agent RL, bio-age, protocol, circadian. Modelele ML sunt bundled (~310 MB) în containerul HF Space.
- **Ollama Cloud** — LLM extern pentru chat-ul nutrițional, apelat server-side din frontend.

## Structura repo-ului

```
NeuroSnap Vision/
├── frontend/                 # Next.js 16 PWA (propriul repo git: github.com/Andrei1loc1/NeuroSnapVision)
├── backend/
│   ├── hf-space/             # FastAPI Python — deploy HF Space (singura sursă)
│   ├── gradio-space/         # Space Gradio standalone (fallback predict)
│   ├── yolo-space/           # Space Gradio standalone (fallback predict)
│   ├── venv/                 # Virtualenv local (Windows)
│   ├── requirements.txt      # Dependențe (copie a hf-space/requirements.txt)
│   ├── run_backend.ps1       # Wrapper dev: cd hf-space + uvicorn --reload
│   └── .env.example          # Template variabile de mediu backend
├── context/                  # Documentație context proiect
├── PLAN_PUBLICATION.md       # Plan implementare publicație
└── README.md                # Acest fișier
```

> Notă: `frontend/` are propriul istoric git (`github.com/Andrei1loc1/NeuroSnapVision`). Directoriul `backend/gradio-space/` și `backend/yolo-space/` sunt Spaces Gradio standalone folosite ca fallback pentru predicție.

## Quick start

Pentru a rula aplicația local ai nevoie de ambele componente pornite simultan:

- **Frontend** → vezi [`frontend/README.md`](frontend/README.md)
- **Backend** → vezi [`backend/README.md`](backend/README.md)

## Variabile de mediu (overview)

Tabelul de mai jos listează toate variabilele de mediu folosite în proiect, fără valori. Pentru descrieri complete și setup vezi README-urile frontend/backend.

### Frontend (`frontend/.env.local`)

| Variabilă | Scope | Secret |
|-----------|-------|--------|
| `DATABASE_URL` | server-only | da |
| `SESSION_SECRET` | server-only | da |
| `BACKEND_URL` | server-only | nu |
| `INTERNAL_API_TOKEN` | server-only | da |
| `OLLAMA_CLOUD_URL` | server-only | nu |
| `OLLAMA_MODEL` | server-only | nu |
| `OLLAMA_CLOUD_API_KEY` | server-only | da |
| `BLOB_READ_WRITE_TOKEN` | server-only | da |
| `NEXT_PUBLIC_SITE_URL` | public | nu |
| `NEXT_PUBLIC_SENTRY_DSN` | public | nu |
| `SENTRY_DSN` | server-only | nu |
| `SENTRY_ORG` | server-only | nu |
| `SENTRY_PROJECT` | server-only | nu |
| `SENTRY_AUTH_TOKEN` | server-only (CI) | da |

> Sentry este integrat prin `sentry.{client,server,edge}.config.ts`. Integrarea este activă doar când DSN-urile sunt setate. Pentru source maps în CI setează `SENTRY_AUTH_TOKEN`.

### Backend (`backend/hf-space/.env` sau HF Space Secrets)

| Variabilă | Secret |
|-----------|--------|
| `INTERNAL_API_TOKEN` | da |
| `ALLOWED_ORIGINS` | nu |
| `DEBUG` | nu |
| `PORT` | nu |

## Deploy

- **Frontend (Vercel)** → instrucțiuni în [`frontend/README.md`](frontend/README.md#deploy-vercel)
- **Backend (Hugging Face Space)** → instrucțiuni în [`backend/README.md`](backend/README.md#deploy-pe-hf-space)