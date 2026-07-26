# NeuroSnap Vision

Aplicație web (PWA) de monitorizare a stilului de viață bazată pe **viziune artificială**. Scanează mâncarea cu camera telefonului, estimează **vârsta biologică** pe 7 dimensiuni, generează **rapoarte** săptămânale și oferă **recomandări personalizate** printr-un asistent AI.

## Ce face

- **Scanare alimente prin cameră** — fotografiezi mâncarea, modelul YOLO detectează regiunile, EfficientNet clasifică alimentele, aplicația calculează calorii/macronutrienți. Selectezi porția, confirmi, masa se loghează automat.
- **Vârstă biologică** — estimează vârsta corpului tău din date reale (nutriție, somn, mișcare, sistem nervos, lumină, subiectiv, hormesis). Afișează trend pe 7/30/90/365 zile, vârsta organelor (creier, cardio, metabolic, imunitar) și punctul de maxim impact (leverage point).
- **Ritual zilnic** — check-in dimineața și seara (dispoziție, energie, stres, digestie, somn). Urmărește streak-uri și un calendar de consecvență.
- **Rapoarte** — calorii săptămânale, balans macro, scor MIND (sănătate cerebrală), timing nutrițional, comparație săptămână-vs-săptămână, export CSV.
- **Asistent AI** — chat cu context real: știe vârsta ta biologică, scorurile pe dimensiuni, obiectivul tău (North Star). Răspunsuri ancorate în sens, nu în vinovăție.
- **Experimente n=1** — creează experimente personale cu durată, metrică urmărită, status. Aplicația calculează progresul automat.
- **Jurnal criptat E2E** — reflecții personale criptate AES-GCM client-side, cheia nu părăsește device-ul.
- **Fereastră solară/metabolică** — calcul astronomic real pentru locația ta, arată când metabolisma e la eficiență maximă.
- **Zi de repaus digital** (Sabbath) — blochează aplicația în ziua aleasă pentru detox digital.

## Cum o folosești

1. Deschizi aplicația în browser (sau o instalezi ca PWA pe telefon — Add to Home Screen).
2. Onboarding în 8 pași: nume, vârstă, sex, greutate/înălțime, tip corporal, nivel activitate, obiectiv, ore somn.
3. Scanezi mese cu butonul "Loghează o masă" (Home sau Jurnal).
4. Check-in zilnic în secțiunea Ritual.
5. Urmărește bio-age-ul, scorurile și tendințele în dashboards.
6. Cere sfaturi asistentului AI când ai întrebări.
7. Revizuiește rapoartele săptămânale + ajustează obiectivele.

## Stack tehnic

| Componentă | Tehnologie |
|-----------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma 7 (PostgreSQL via Accelerate), PWA |
| Backend | FastAPI Python 3.11, TensorFlow, Ultralytics YOLO, scikit-learn |
| ML | YOLO segmentation (detecție alimente) + EfficientNetB4 (clasificare 270 clase) |
| AI Chat | Ollama Cloud (nemotron-3-ultra) |
| Deploy | Vercel (frontend) + Hugging Face Space (backend) |
| Storage | Prisma Accelerate (date), Vercel Blob (imagini) |

## Rulează local

### Cerințe

- Node.js 18+, npm 10+
- Python 3.11+, pip
- Cont Prisma Accelerate (gratuit) — https://console.prisma.io
- Cont Ollama Cloud (pentru AI chat) — https://cloud.ollama.com
- (Opțional) Cont Vercel Blob pentru upload imagini

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # completează cu valorile tale
npx prisma generate
npx prisma db push            # sincronizează schema
npm run dev                   # http://localhost:3000
```

### Backend

```bash
cd backend/hf-space
python -m venv venv
source venv/bin/activate      # pe Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # completează INTERNAL_API_TOKEN + ALLOWED_ORIGINS
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Modelele ML (~310 MB: YOLO + EfficientNet + sklearn) sunt în `backend/hf-space/models/` și trebuie descărcate separat sau copiate dintr-un backup.

### Variabile de mediu

Vezi `frontend/.env.example` și `backend/.env.example` pentru lista completă cu descrieri. Cele critice:

- `DATABASE_URL` — URL Prisma Accelerate (obligatoriu)
- `SESSION_SECRET` — secret HMAC pentru sesiuni (obligatoriu, min 32 bytes)
- `INTERNAL_API_TOKEN` — shared secret frontend↔backend (obligatoriu, identic pe ambele)
- `ALLOWED_ORIGINS` — origini frontend permise de backend (obligatoriu pe backend)
- `OLLAMA_CLOUD_API_KEY` — pentru AI chat (obligatoriu pentru chat)

## Deploy

### Frontend pe Vercel

1. Conectează repo-ul `github.com/Andrei1loc1/NeuroSnapVision` în Vercel
2. Root Directory: `frontend`
3. Setează toate variabilele de mediu din `.env.example` în Vercel → Settings → Environment Variables
4. Build command: `npm run build` (include `prisma generate`)
5. Auto-deploy pe push la `main`

### Backend pe Hugging Face Space

1. Creează un Docker Space pe https://huggingface.co/new-space (SDK: Docker)
2. Conținutul din `backend/hf-space/` e gata configurat (Dockerfile + app.py + models/)
3. Push către Space: `git push hf main` (sau upload manual)
4. Setează în Space → Settings → Variables and secrets:
   - `INTERNAL_API_TOKEN` (aceeași valoare ca în Vercel)
   - `ALLOWED_ORIGINS` (URL-ul tău de producție, ex: `https://frontend-six-phi-87.vercel.app,http://localhost:3000`)
5. Space-ul se build-uiește automat (10-20 min prima dată din cauza modelelor)

## Securitate

- Sesiuni HMAC cu expirare 30 zile (nu 1 an)
- Backend protejat cu shared secret (`X-Internal-Token`) — refuză request-uri fără token
- CORS restrictiv (doar originile din `ALLOWED_ORIGINS`)
- Validare input cu modele Pydantic pe toate rutele backend
- Rate limiting pe rutele costisitoare (`/predict`: 10 req/min)
- Nicio cheie API nu e expusă client-side (toate env vars sunt `server-only`)
- Error handling global cu JSON consistent, fără traceback în producție

## Structură repo

```
NeuroSnap Vision/
├── frontend/                  # Next.js 16 PWA (repo git separat)
├── backend/
│   ├── hf-space/              # FastAPI pentru deploy (singura sursă backend)
│   ├── gradio-space/          # Fallback Gradio pentru clasificare
│   ├── yolo-space/             # Fallback Gradio pentru detecție YOLO
│   └── requirements.txt        # Dependențe Python
├── PLAN_PUBLICATION.md         # Plan de implementare
└── README.md                   # Acest fișier
```

## Licență

Privat. Toate drepturile rezervate.