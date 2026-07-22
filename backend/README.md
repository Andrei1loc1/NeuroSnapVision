# NeuroSnap Vision — Backend

Acest director conține implementarea serviciului de inteligență artificială al aplicației **NeuroSnap Vision**. Este un API **Python FastAPI stateless**, responsabil exclusiv de inferență: clasificarea imaginilor alimentare, estimarea nutrițională, scorarea sănătății, analiza MIND, recomandări multi-agent, bio-age și protocol.

## Arhitectură unificată (Pas 3.2 — Opțiunea A)

Începând cu această versiune există **o singură sursă** pentru codul backend: `hf-space/`. Directoriul root `backend/` păstrează doar `venv/`, scripturi și documentație.

```
backend/
├── hf-space/                # SINGURA sursă (entry point + servicii + modele)
│   ├── app.py               # Entry point FastAPI (lazy loading) — folosit și pentru dev, și pentru deploy
│   ├── schemas.py           # Pydantic schemas
│   ├── requirements.txt     # Dependențe (copie sincronizată cu root)
│   ├── Dockerfile           # Deploy HF Space
│   ├── README.md            # README HF Space
│   ├── agents/              # Sistem multi-agent Q-learning
│   ├── models/              # Modele pre-antrenate
│   └── services/            # Servicii (vezi lista mai jos)
├── venv/                    # Virtualenv local (Windows)
├── requirements.txt         # Copy identic al hf-space/requirements.txt
├── run_backend.ps1          # Wrapper dev: cd hf-space + uvicorn --reload
├── .env.example             # Template variabile de mediu
└── README.md                # Acest fișier
```

**Motivul unificării:** înainte existau două entry points (`main.py` root cu eager imports + `hf-space/app.py` cu lazy loading) și două copii ale `services/` aproape identice. Sincronizarea manuală ducea la drift (ex. `prediction_service.py` root avea YOLO, cel din hf-space nu). Acum `hf-space/app.py` este versiunea unică — cu lazy loading corect, YOLO activat, și rutele nefolosite eliminate.

## Tehnologii de bază

- **FastAPI** + **Uvicorn**
- **TensorFlow / Keras** (YOLO segmentation + EfficientNet classifier)
- **scikit-learn** (clasificator pattern MIND)
- **Pillow** + **NumPy** (procesare imagini)
- **slowapi** (rate limiting)

## Funcționalități principale

- **Clasificare alimentară** — segmentare YOLO + CNN EfficientNet, estimare porție
- **Estimare nutrițională** — lookup JSON + scalare după porție (small/medium/large)
- **Scor sănătate** — scor compozit 0-100 bazat pe deviații față de target
- **Analiză MIND** — scor nutriție cerebrală și clasificare pattern dietetic
- **Recomandări multi-agent** — 5 agenți Q-learning (proteină, calorii, timing, grăsimi, consistență)
- **Bio Age / Protocol / Circadian** — module longevitate

## Prerequisites

- **Python ≥ 3.11**
- **pip**
- **venv** (sau `virtualenv`)
- Spațiu liber ~600 MB pentru modelele ML din `hf-space/models/`

## Cum rulezi (dev)

```bash
cd backend/hf-space
python -m venv venv
# Windows:   venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # apoi completează valorile reale
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Serverul pornește la `http://127.0.0.1:8000`. Portul implicit pentru HF Space este 7860.

> Alternativ, din root `backend/` rulează `.\run_backend.ps1` — wrapper-ul face `cd hf-space` + `uvicorn --reload`.

## Variabile de mediu

Copiază `.env.example` în `.env` și completează valorile reale.

| Variabilă | Secret | Descriere |
|-----------|--------|-----------|
| `INTERNAL_API_TOKEN` | da | Shared secret cu frontend, validat prin header-ul `X-Internal-Token`. Dacă e unset, autentificarea internă e dezactivată (dev mode — backend loghează un warning). |
| `ALLOWED_ORIGINS` | nu | CSV cu originile frontend permise pentru CORS. Ex: `https://neurosnap-vision.vercel.app,http://localhost:3000`. Default: `http://localhost:3000`. |
| `DEBUG` | nu | Setează `"true"` pentru a include traceback în răspunsurile de eroare 500 (doar dev). Default: gol/false. |
| `PORT` | nu | Port de ascultare. Default 8000 local, 7860 pe HF Space. |
| `SENTRY_DSN` | nu | (Opțional) DSN Sentry pentru monitorizare erori backend. Dacă nu este setat, integrarea Sentry rămâne inactivă. |

## Rute API (păstrate)

| Endpoint | Metoda | Scop |
|----------|--------|------|
| `/` | GET | Health check root |
| `/health` | GET | Status modele + uptime |
| `/predict`, `/scan` | POST | Clasificare imagine + estimare nutriție (`/scan` și `/predict` sunt alias-uri) |
| `/predict-raw` | POST | Endpoint de test — citește body-ul raw fără `UploadFile` (debug) |
| `/debug/error` | GET | Endpoint de test care ridică o excepție (verifică traceback / Sentry) |
| `/recommendation` | POST | Recomandare multi-agent RL |
| `/healthy-score` | POST | Scor compozit sănătate |
| `/mind-score` | POST | Analiză MIND + scor cerebral |
| `/protocol/morning` | POST | Check-in protocol de dimineață |
| `/protocol/evening` | POST | Check-in protocol de seară |
| `/protocol/today` | GET | Protocol zilnic + streak |
| `/bio-age/snapshot` | POST | Snapshot bio-age din date complete |
| `/bio-age/current` | GET | Bio-age curent (`user_id`, `age`) |
| `/bio-age/history` | GET | Istoric bio-age (`user_id`, `days`) |
| `/workout/log` | POST | Log antrenament |
| `/workout/weekly` | GET | Movement score săptămânal |
| `/intervention/today` | POST | Intervenție zilnică recomandată |
| `/circadian/score` | POST | Scor nutriție circadiană |

Lista de mai sus reflectă rutele efectiv declarate în `hf-space/app.py`.

Toate rutele (mai puțin `/` și `/health`) sunt protejate de middleware-ul `X-Internal-Token` când `INTERNAL_API_TOKEN` este setat.

## Rute eliminate (Pas 4.6 — Opțiunea A)

Următoarele rute au fost eliminate pentru că frontend-ul are implementări proprii în Prisma/TypeScript și nu le apelează:

| Endpoint eliminat | Înlocuit în frontend de |
|-------------------|------------------------|
| `/solar-window` | `app/api/circadian/solar-window/route.ts` (implementare TS proprie) |
| `/hrv/process`, `/hrv/breathing` | `app/api/hrv/reading/route.ts` (salvează direct în Prisma) |
| `/allostatic/load` (GET + POST), `/allostatic/trajectory` | `app/api/allostatic/*` (Prisma) |

Serviciile Python corespunzătoare au fost șterse (nu mai sunt referențiate de nicio rută păstrată):

| Serviciu eliminat | Motiv |
|-------------------|-------|
| `services/solar_service.py` (329 linii) | Folosit doar de `/solar-window` (eliminat). Niciun alt import. |
| `services/allostatic_service.py` | Folosit doar de `/allostatic/*` (eliminat). Niciun alt import. |
| `services/hrv_service.py` | Folosit doar de `/hrv/*` (eliminat) și intern de `allostatic_service` (și el eliminat). `bio_age_service` are propria implementare internă `_compute_allostatic_load` și nu apelează `hrv_service.classify_stress_level`. |

## Servicii păstrate (`hf-space/services/`)

| Serviciu | Folosit de | Scop |
|----------|-----------|------|
| `prediction_service.py` | `/predict`, `/scan` | YOLO segmentation + EfficientNet classifier (versiunea cu YOLO, unificată cu setările de mediu din hf-space) |
| `nutrition_service.py` | `prediction_service`, `mind_score_service`, `/healthy-score` | Lookup nutrițional JSON + scalare porție |
| `mind_score_service.py` | `/mind-score` | Scor MIND + clasificare pattern dietetic |
| `protocol_service.py` | `/protocol/*` | Check-in protocol + compliance streak |
| `bio_age_service.py` | `/bio-age/*` | Scor bio-age pe 7 dimensiuni (cu hazard ratios). Folosește intern `vo2max_service`, `hormesis_service`, `inflammaging_service`. |
| `circadian_service.py` | `/circadian/score` | Scor nutriție circadiană |
| `workout_service.py` | `/workout/*` | Log antrenament + movement score |
| `intervention_service.py` | `/intervention/today` | Intervenție zilnică recomandată |
| `vo2max_service.py` | `bio_age_service` (dimensiunea cardio) | Estimare VO2max + hazard ratio |
| `hormesis_service.py` | `bio_age_service` (dimensiunea hormesis) | Scor hormesis + hazard ratio |
| `inflammaging_service.py` | `bio_age_service` (dimensiunea inflammaging) | Scor inflammaging + hazard ratio |

## Modele ML (`hf-space/models/`)

| Model | Fișier | Mărime | Scop |
|-------|--------|--------|------|
| YOLO segmentation | `yolo_foodseg_best.pt` | 52 MB | Segmentare preparate alimentare |
| EfficientNet classifier | `nutritrack_B4_SUPREM.keras` | 240 MB | Clasificare 270 clase alimentare |
| MIND classifier | `mind_pattern_model.pkl` | 3,4 MB | Clasificare pattern dietetic |
| Q-Tables | `multi_agent_q_tables.json` | — | Tabele Q-learning pentru agenți |

## Deploy pe HF Space

Deploy-ul folosește `hf-space/Dockerfile` și tratează `hf-space/` ca rădăcină (`WORKDIR /app`, `COPY . .`).

1. **Dockerfile** — `hf-space/Dockerfile` este configurat: `EXPOSE 7860`, `ENV PORT=7860`, modelele sunt copiate în container.
2. **Modele ML** — sunt bundled în `hf-space/models/` (~310 MB total). Nu necesită download la runtime.
3. **Secrets pe HF Space** — în Space Settings → Repository secrets setează:
   - `INTERNAL_API_TOKEN` (aceeași valoare ca în frontend / Vercel)
   - `ALLOWED_ORIGINS` (originea frontend, ex `https://neurosnap-vision.vercel.app`)
   - (opțional) `SENTRY_DSN`
4. **Push** — adaugă remote-ul HF (o dată) și apoi push:

```bash
# Adaugă remote-ul HF Space (o singură dată)
git remote add hf https://huggingface.co/spaces/USER/neurosnap-vision
git push hf main
```

5. **Rebuild manual** — alternativ la push, poți declanșa un rebuild din UI-ul HF Space (Settings → Factory reboot / Restart Space).

> Atunci când schimbi `backend/requirements.txt`, actualizează și `hf-space/requirements.txt` (sunt sincronizate intenționat).

## Troubleshooting

| Simptom | Cauză probabilă | Soluție |
|---------|-----------------|---------|
| Răspuns `{"error": "Prediction service unavailable"}` sau "Model not loaded" | Modelele ML lipsă sau încărcare eșuată | Verifică că fișierele modelelor există în `hf-space/models/` (`yolo_foodseg_best.pt`, `nutritrack_B4_SUPREM.keras`, `mind_pattern_model.pkl`). Verifică log-urile de startup pentru erori de import TensorFlow / ultralytics |
| `401 Unauthorized` / `403` de la backend | `INTERNAL_API_TOKEN` diferit între frontend și backend | Setează `INTERNAL_API_TOKEN` în ambele (Vercel + HF Space) cu **aceeași valoare**. Dacă e unset în backend, auth-ul e dezactivat (dev mode) — vezi warning în log |
| Eroare CORS în browser (preflight blocat) | Originea frontend nu e în `ALLOWED_ORIGINS` | Adaugă originea frontend (ex `https://neurosnap-vision.vercel.app`) în `ALLOWED_ORIGINS`, separate prin virgulă. Default: `http://localhost:3000` |
| Cold start lent (15–40s) la prima cerere | HF free tier + TensorFlow + YOLO se încarcă lazy | **Normal** pentru HF free tier. Modelele se încarcă o singură dată la prima cerere (`_load_services()` este lazy). Cererile ulterioare sunt rapide. Pentru producție cu SLA, mută backend-ul pe un serviciu dedicat |
| `OSError` / import TensorFlow la startup | Versiuni incompatibile în `requirements.txt` | Recreează venv: `rm -rf venv && python -m venv venv` și reinstalează `pip install -r requirements.txt` |
| Eroare 500 cu `detail` gol în producție | `DEBUG` este gol/false (comportament corect) | Pentru a vedea traceback setează temporar `DEBUG="true"` (doar în dev). În producție, folosește `SENTRY_DSN` pentru capturarea erorilor |
| Build HF Space fail (out of space) | Modelele (~310 MB) + dependențe depășesc limita de spațiu | Verifică că `.gitattributes` include LFS pentru modelele mari dacă e cazul; curăță fișierele nefolosite din `hf-space/` |

## Notă de arhitectură

Backend-ul este complet stateless: nu gestionează sesiuni sau bază de date — starea utilizatorului se află în frontend și PostgreSQL. Modelele sunt încărcate o singură dată la startup (lazy, prin `_load_services()` declanșat de `@app.on_event("startup")` și apel în fiecare handler).