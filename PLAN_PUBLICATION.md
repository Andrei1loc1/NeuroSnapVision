# Plan de Implementare NeuroSnap Vision — Pregătire pentru Publicare

Plan structurat pe faze, cu pași clari pentru execuție paralelă de către agenți. Fiecare pas are: scop, locație, ce face agentul, criterii de acceptanță, dependențe.

---

## FAZA 0 — Securitate & Secrete (BLOCKER ABSOLUT)

### Pas 0.1 — Audit istoric git pentru secrete expuse
- **Scop**: verifică dacă `OLLAMA_CLOUD_API_KEY`, `DATABASE_URL`, `SESSION_SECRET` au fost committate în git.
- **Unde**: ambele repo-uri (frontend + root/backend).
- **Ce face agentul**: caută în `git log --all -p` pattern-uri de secret. Raportează commit-uri afectate.
- **Criterii**: listă completă commit-uri afectate sau confirmare că niciunul.
- **Dependențe**: nimic.

### Pas 0.2 — Setați `SESSION_SECRET` în Vercel
- **Scop**: elimină fallback-ul periculos `"dev-secret-change-in-production"`.
- **Unde**: Vercel env vars + `frontend/lib/server/session.ts`.
- **Ce face agentul**: generează secret 32 bytes, setează în Vercel, modifică codul să arunce eroare la startup dacă lipsește.
- **Criterii**: `SESSION_SECRET` setat în Vercel; cod fail-fast; build OK.
- **Dependențe**: Pas 0.1.

### Pas 0.3 — Rotire chei API compromise
- **Scop**: invalidează cheile Ollama Cloud, Prisma Accelerate, Vercel Blob.
- **Unde**: servicii externe + `.env*` + Vercel env.
- **Ce face agentul**: generează chei noi, actualizează env, revocă vechile.
- **Criterii**: toate serviciile funcționează cu chei noi; vechile returnează 401.
- **Dependențe**: Pas 0.1.

### Pas 0.4 — Elimină `NEXT_PUBLIC_BACKEND_URL`
- **Scop**: oprește expunerea URL-ului backend către client.
- **Unde**: `frontend/.env*`, `frontend/lib/server/env.ts`, `frontend/README.md`.
- **Ce face agentul**: convertește toate referințele la `BACKEND_URL` (server-only), elimină din env samples + README, adaugă `.env.example`.
- **Criterii**: nicio referință `NEXT_PUBLIC_*` backend în cod; `BACKEND_URL` funcționează server-side.
- **Dependențe**: nimic.

### Pas 0.5 — Documentație env vars actualizată
- **Scop**: `README.md` listează env vars învechiți.
- **Unde**: `frontend/README.md`, `backend/README.md`.
- **Ce face agentul**: listează complet toți env vars, marchează server-only vs public, adaugă `.env.example`.
- **Criterii**: README + `.env.example` sincronizate cu codul.
- **Dependențe**: Pas 0.2, 0.3, 0.4.

---

## FAZA 1 — Blockeri backend pentru publicare

### Pas 1.1 — Pin toate dependențele în `requirements.txt`
- **Scop**: reproducibilitate zero în prezent.
- **Unde**: `backend/requirements.txt`, `backend/hf-space/requirements.txt`.
- **Ce face agentul**: pin fiecare dep la `>=MIN,<MAX`. Sincronizează ambele fișiere. Adaugă `slowapi` (pentru Pas 1.5).
- **Criterii**: `pip install` reușește cu Python 3.11; Docker build OK.
- **Dependențe**: Pas 4.4 (decizie scipy).

### Pas 1.2 — Exception handler global + JSON error consistent
- **Scop**: `main.py` nu are try/except → 500 HTML; `hf-space/app.py` expune traceback.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`.
- **Ce face agentul**: adaugă `@app.exception_handler(Exception)` cu JSON `{error, code, request_id}` fără traceback în producție. Handler pentru `HTTPException` + `RequestValidationError`. Elimină traceback din `hf-space/app.py:124`. Logging cu `logging` + `request_id`.
- **Criterii**: orice eroare → JSON 5xx consistent; niciun traceback în producție; `request_id` prezent.
- **Dependențe**: nimic.

### Pas 1.3 — CORS restrictiv + auth shared secret
- **Scop**: backend HF Space public; CORS invalid.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`, `frontend/lib/server/env.ts`, rute proxy frontend.
- **Ce face agentul**: CORS cu `ALLOWED_ORIGINS` din env (nu `["*"]`); `allow_credentials=False`. Shared secret `INTERNAL_API_TOKEN` ca env var pe ambele părți. Backend: middleware verifică `X-Internal-Token`. Frontend: adaugă header la toate fetch-urile către backend.
- **Criterii**: request fără token → 401; request cu token corect → OK; CORS blochează origini nepermise.
- **Dependențe**: Pas 1.2.

### Pas 1.4 — Modele Pydantic pentru toate rutele POST
- **Scop**: `data: dict` peste tot → KeyError 500.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`.
- **Ce face agentul**: creează modele Pydantic pentru fiecare rută POST cu câmpuri, tipuri, defaults, constrângeri. Sincronizează în `hf-space/app.py`.
- **Criterii**: POST fără câmpuri obligatorii → 422; POST valid → funcționează; niciun `data["..."]` direct.
- **Dependențe**: Pas 1.2.

### Pas 1.5 — Rate limiting pe rutele costisitoare
- **Scop**: DoS trivial pe `/predict` (240 MB model pe CPU).
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`.
- **Ce face agentul**: `slowapi` cu limite per IP: `/predict` 10/min, altele 60-120/min. 429 cu `retry_after`.
- **Criterii**: cereri peste limită → 429; funcționalitate normală OK.
- **Dependențe**: Pas 1.1, 1.2.

### Pas 1.6 — Health check real `/health`
- **Scop**: ruta `GET /` nu verifică starea modelelor.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`.
- **Ce face agentul**: `GET /health` returnează `models_loaded, yolo_loaded, classifier_loaded, mind_model_loaded, uptime_seconds, version`. Fără auth.
- **Criterii**: `/health` < 10ms; HF Space health check OK.
- **Dependențe**: Pas 1.3.

### Pas 1.7 — Elimină `traceback` din `/debug/error`
- **Scop**: scurgere info în producție.
- **Unde**: `backend/hf-space/app.py`.
- **Ce face agentul**: eliminină sau protehează ruta cu `INTERNAL_API_TOKEN` + `DEBUG=true`.
- **Criterii**: `/debug/error` fără auth → 401 sau 404.
- **Dependențe**: Pas 1.3.

---

## FAZA 2 — Blockeri frontend pentru publicare

### Pas 2.1 — Fix `useReports` age bug
- **Scop**: `user.age` nu există pe `StoredUser` → mereu 30.
- **Unde**: `frontend/hooks/useReports.ts:406`, `frontend/components/home/DashboardGrid.tsx:17`.
- **Ce face agentul**: creează `getProfileAge()` în `lib/auth/profile.ts`. Înlocuiește toate `user.age`/`user.chronologicalAge`/`(user as any).age` cu `getProfileAge()`.
- **Criterii**: nicio referință `user.age`; vârsta reală în calcule; typecheck OK.
- **Dependențe**: nimic.

### Pas 2.2 — Fix `chronoAge=40` hardcodat
- **Scop**: `app/api/purpose/alignment/route.ts:114` nu folosește vârsta reală.
- **Unde**: `frontend/app/api/purpose/alignment/route.ts`, `frontend/app/api/purpose/daily-coach/route.ts`.
- **Ce face agentul**: citește user din DB cu `select: { age: true }` (sau trimite din client). Verifică toate rutele `/api/purpose/*`.
- **Criterii**: niciun `chronoAge = 40` hardcodat; vârsta reală folosită.
- **Dependențe**: Pas 2.1.

### Pas 2.3 — Fix `bio-age/snapshot` cu metrics reali
- **Scop**: feature flagship nefuncțional — toate scorurile default 50.
- **Unde**: `frontend/app/api/bio-age/snapshot/route.ts`, `frontend/hooks/useBioAge.ts`, `backend/main.py` ruta `/bio-age/current`, `backend/services/bio_age_service.py`.
- **Ce face agentul**: backend transformă `/bio-age/current` în POST cu `metrics` complet (meals, protocols, workouts, sleep, hrv, etc.). Frontend proxy adună din Prisma + localStorage + trimite POST. Backend folosește metrics pentru fiecare dimensiune.
- **Criterii**: scoruri reale bazate pe date user; `biologicalAge ≠ chronologicalAge` când justificat; `leverage_point` cu `currentScore` real.
- **Dependențe**: Pas 1.4, Pas 2.1.

### Pas 2.4 — Fix `useReports` compliance + week-over-week
- **Scop**: streak mereu 0/1; week-over-week nu funcționează.
- **Unde**: `frontend/hooks/useReports.ts`, `frontend/app/reports/page.tsx`.
- **Ce face agentul**: `COMPLIANCE_KEY` acumulează entries per zi (sau mută în Prisma). `LAST_WEEK_KEY` per-user (`userKey`). Mută `localStorage.setItem` din useMemo în useEffect. Fix week-over-week logic.
- **Criterii**: streak real; week-over-week cu trends non-zero; nicio scriere din useMemo.
- **Dependențe**: nimic.

### Pas 2.5 — Fix onboarding: spinner infinit + refresh pierdere progres
- **Scop**: eroare login → spinner infinit; refresh pierde tot.
- **Unde**: `frontend/app/onboarding/page.tsx`.
- **Ce face agentul**: adaugă `errorMessage` state + afișează la eroare. Persistă `step` + `data` în localStorage cu `STORAGE_KEYS.ONBOARDING_STEP`. Restaurează la mount. Curăță la final.
- **Criterii**: eroare login → mesaj vizibil; refresh păstrează progres; storage curățat după onboarding.
- **Dependențe**: nimic.

### Pas 2.6 — Sesiune cu expirare reală
- **Scop**: sesiunea durează 1 an — prea lung.
- **Unde**: `frontend/lib/server/session.ts`.
- **Ce face agentul**: reducere `maxAge` la 30 zile. Verifică `verifySession` respinge token-uri expirate. Logging pentru token-uri expirate.
- **Criterii**: sesiune expiră după 30 zile; token expirat → redirect onboarding.
- **Dependențe**: Pas 0.2.

### Pas 2.7 — Elimină fallback date sintetice
- **Scop**: componente afișează date false ca reale.
- **Unde**: `frontend/components/reports/WeeklyCaloriesCard.tsx`, `frontend/components/reports/MacroBalanceCard.tsx`, `frontend/app/bio-age/page.tsx`, `frontend/components/journal/WorkoutTimeline.tsx`, `frontend/components/home/BrainHealthCard.tsx`.
- **Ce face agentul**: elimină `defaultData` — afișează skeleton/empty state. Bio-age trend: ascunde mini-chart dacă istoric < 2. Workout: afișează scor relativ, NU "kcal" dacă nu ai formulă reală.
- **Criterii**: nicio valoare inventată afișată ca reală; loading/empty states vizibile.
- **Dependențe**: Pas 2.3.

### Pas 2.8 — Pagină 404 + robots.txt + sitemap.ts
- **Scop**: lipsă pentru publicare.
- **Unde**: `frontend/app/not-found.tsx` (nou), `frontend/app/robots.ts` (nou), `frontend/app/sitemap.ts` (nou).
- **Ce face agentul**: 404 branded cu logo + buton home. robots.txt cu `Disallow: /api/`. sitemap.ts cu paginile publice.
- **Criterii**: `/nonexistent` → 404 branded; `/robots.txt` corect; `/sitemap.xml` valid.
- **Dependențe**: nimic.

### Pas 2.9 — PWA assets: manifest + icons + SW fix
- **Scop**: PWA nu se instalează corect.
- **Unde**: `frontend/public/manifest.json`, `frontend/public/sw.js`, `frontend/app/layout.tsx`.
- **Ce face agentul**: manifest cu `display: standalone`, icon-uri 192/512 maskable, `scope`, `lang: "ro"`, shortcuts, screenshots. SW fix `.catch(() => cached)`. Layout: `appleWebApp`, `apple-touch-icon`, `lang: "ro"`, `formatDetection`.
- **Criterii**: Lighthouse PWA > 90; install prompt pe Android; iOS standalone funcțional; SW fără erori.
- **Dependențe**: nimic.

### Pas 2.10 — Curățare dead code frontend
- **Scop**: 10+ componente neutilizate.
- **Unde**: `frontend/components/home/*` (10 fișiere), `frontend/components/onboarding/OnboardingForm.tsx`, `frontend/components/ai/ChatOverlay.tsx`, `frontend/components/ai/FloatingChatButton.tsx`, `frontend/components/bio-age/NeuroGraph.tsx`.
- **Ce face agentul**: verifică cu grep că nu sunt importate, șterge, rulează build.
- **Criterii**: niciun fișier mort; build fără warnings.
- **Dependențe**: nimic.

### Pas 2.11 — Curățare `catch {}` goale cu impact user
- **Scop**: 23 `catch {}` goale, multe suprimă erori user-afectabile.
- **Unde**: `frontend/app/onboarding/page.tsx`, `frontend/app/profile/edit/page.tsx`, `frontend/app/profile/goals/page.tsx`, `frontend/app/journal/page.tsx`, `frontend/app/experiments/page.tsx`, `frontend/components/home/DailyLeverageCard.tsx`, `frontend/hooks/useAIChat.ts`.
- **Ce face agentul**: adaugă `console.error` + feedback UI (Toast) pentru erorile user-afectabile.
- **Criterii**: niciun `catch {}` gol cu impact user; feedback UI pe erori.
- **Dependențe**: nimic.

### Pas 2.12 — Curățare storage rezidual la schimbare user
- **Scop**: `lib/auth/user.ts` nu curăță toate cheile per-user.
- **Unde**: `frontend/lib/auth/user.ts`, `frontend/lib/auth/context.tsx`, `frontend/lib/auth/userStorage.ts`.
- **Ce face agentul**: inventariază toate cheile localStorage, creează `clearUserStorage(userId)`, apelează la login (schimbare user) + logout.
- **Criterii**: după schimbare user, fără date reziduale; logout curăță complet.
- **Dependențe**: nimic.

### Pas 2.13 — Fix Navbar `localStorage.getItem("neurosnap_profile")` fără userKey
- **Scop**: citește cheia globală, nu per-user.
- **Unde**: `frontend/components/layout/Navbar.tsx`.
- **Ce face agentul**: înlocuiește cu `getStoredProfile()` sau `getUserItem(STORAGE_KEYS.PROFILE)`.
- **Criterii**: Navbar afișează date user curent.
- **Dependențe**: Pas 2.12.

### Pas 2.14 — Fix `mealType: "SNACK"` hardcodat
- **Scop**: toate scanările salvate ca "SNACK".
- **Unde**: `frontend/lib/predict.ts`, `frontend/components/camera/CameraScanner.tsx`, `frontend/components/camera/PredictionPanel.tsx`.
- **Ce face agentul**: detectare automată pe baza oreii (BREAKFAST/LUNCH/DINNER/SNACK). Selector manual în PredictionPanel.
- **Criterii**: mese scanate dimineața → "BREAKFAST"; user poate suprascrie; jurnal afișează corect.
- **Dependențe**: nimic.

### Pas 2.15 — Fix `Experiments` durationDays + progress
- **Scop**: `durationDays` mereu 0 pentru experimente custom.
- **Unde**: `frontend/app/experiments/page.tsx`.
- **Ce face agentul**: verifică schema Prisma, setează `protocol.durationDays` la save, cere `durationDays` în wizard custom, fix `getProgress`.
- **Criterii**: progress bar se populază; "Ziua X din Y" cu Y corect.
- **Dependențe**: nimic.

### Pas 2.16 — Fix StreakCalendar useMemo stale + EveningReflection deps + useSabbath leak
- **Scop**: calendar nu se actualizează după check-in; reflection rămâne generic; memory leak useSabbath.
- **Unde**: `frontend/components/protocol/StreakCalendar.tsx`, `frontend/components/purpose/EveningReflection.tsx`, `frontend/hooks/useSabbath.ts`.
- **Ce face agentul**: StreakCalendar primește `streakData` ca prop sau se re-trigger la eveniment storage. EveningReflection adaugă `purpose?.northStar` în deps. useSabbath mută cleanup la nivel de useEffect.
- **Criterii**: calendar se actualizează după check-in; reflection contextualizat cu northStar; fără memory leak.
- **Dependențe**: nimic.

### Pas 2.17 — Fix `chatContext` stale în Home
- **Scop**: contextul AI nu se refresh-uiește niciodată.
- **Unde**: `frontend/app/page.tsx`.
- **Ce face agentul**: elimină `chatContext` din deps, adaugă guard, sau TTL, sau refresh la deschiderea chat-ului. Unește dubla redirect la `/onboarding`.
- **Criterii**: context AI se refresh-uiește; fără redirect duplicat.
- **Dependențe**: nimic.

### Pas 2.18 — Dead UI buttons
- **Scop**: butoane fără onClick.
- **Unde**: `frontend/components/reports/AIRecommendationsCard.tsx`, `frontend/components/reports/ReportsHeader.tsx`, `frontend/components/profile/ProfileMenu.tsx`.
- **Ce face agentul**: elimină sau implementează funcționalitate. ProfileMenu: elimină `router.push` redundant.
- **Criterii**: niciun buton fără funcție.
- **Dependențe**: nimic.

### Pas 2.19 — Sabbath settings UI
- **Scop**: buton duce la `/settings` care e 404.
- **Unde**: `frontend/app/settings/page.tsx` (nou), `frontend/components/sabbath/SabbathGate.tsx`, `frontend/components/profile/ProfileMenu.tsx`.
- **Ce face agentul**: creează pagină settings cu toggle Sabbath + selector zi + interval orar. Actualizează buton SabbathGate. Adaugă link în ProfileMenu.
- **Criterii**: `/settings` funcțional; user poate activa/configura Sabbath.
- **Dependențe**: nimic.

### Pas 2.20 — CTA vizibile pentru adăugare masă
- **Scop**: pe Home și Journal nu există buton vizibil pentru adăugare masă.
- **Unde**: `frontend/app/page.tsx`, `frontend/app/journal/page.tsx`.
- **Ce face agentul**: Home: card CTA "Loghează o masă" → `/vision-ai`. Journal: FAB "+" → `/vision-ai`.
- **Criterii**: user nou poate adăuga masă fără să ghicească.
- **Dependențe**: nimic.

### Pas 2.21 — Feedback UI pe acțiuni (toast-uri)
- **Scop**: multe acțiuni sunt silent.
- **Unde**: toate paginile cu acțiuni.
- **Ce face agentul**: sistem toast global (provider + hook `useToast()`) sau folosește `Toast` existent. Toast pentru: salvare workout/masă/experiment/profil/goals, ștergere, status change.
- **Criterii**: toate acțiunile user-afectabile au feedback vizibil; toast-uri dispar după 3s.
- **Dependențe**: Pas 2.11.

### Pas 2.22 — Skeletons/loading states pe pagini cu fetch
- **Scop**: pagini cu fetch afișează blank sau content shift.
- **Unde**: `frontend/app/bio-age/page.tsx`, `frontend/app/reports/page.tsx`, `frontend/app/protocol/page.tsx`, `frontend/app/experiments/page.tsx`, `frontend/app/journal/page.tsx`.
- **Ce face agentul**: adaugă skeleton-uri pe cards înainte de date. Verifică hooks expun `loading` state. Empty states cu CTA.
- **Criterii**: niciun flash de blank; layout shift minim; empty states cu CTA.
- **Dependențe**: Pas 2.7.

---

## FAZA 3 — Backend: funcționalitate lipsă

### Pas 3.1 — Implementează `/bio-age/history` cu date reale
- **Scop**: ruta returnează mereu `{"snapshots": []}`.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`, `backend/services/bio_age_service.py`, `frontend/app/api/bio-age/history/route.ts`.
- **Ce face agentul**: frontend salvează snapshots în Prisma (`BioAgeSnapshot` model). `/api/bio-age/history` citește din Prisma. Backend calculează pace of aging pe array dat.
- **Criterii**: `/bio-age/history` returnează snapshots reale; trend chart cu date reale.
- **Dependențe**: Pas 2.3.

### Pas 3.2 — Unifică `main.py` și `hf-space/app.py`
- **Scop**: două versiuni cu divergențe.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`, `backend/services/*`.
- **Ce face agentul**: alege `hf-space/app.py` ca bază. Migrează sau elimină rute lipsă. Elimină `main.py` sau transformă în dev wrapper. Sincronizează `services/`.
- **Criterii**: un singur entry point; `services/` sincronizate.
- **Dependențe**: Pas 4.6.

### Pas 3.3 — `intervention_service.py` cu `user_id` real
- **Scop**: wrapper 5 linii care ignoră `user_id`.
- **Unde**: `backend/services/intervention_service.py`, ruta `/intervention/today`.
- **Ce face agentul**: extinde să accepte `user_history`. Apelează `compute_leverage_point` cu metrics din history. Frontend trimite istoric.
- **Criterii**: intervenția se personalizează pe baza istoricului.
- **Dependențe**: Pas 2.3, Pas 3.1.

---

## FAZA 4 — Curățare backend dead code

### Pas 4.1 — Șterge `services/intervention_engine.py`
- **Scop**: 85 linii buggy (TypeError), nefolosit.
- **Unde**: `backend/services/intervention_engine.py`, `backend/hf-space/services/intervention_engine.py`.
- **Ce face agentul**: grep confirmă nefolosire → șterge din ambele locuri.
- **Criterii**: fișiere șterse; backend pornește OK.
- **Dependențe**: nimic.

### Pas 4.2 — Șterge `services/reports_analysis_service.py`
- **Scop**: 420 linii nefolosite.
- **Unde**: `backend/services/reports_analysis_service.py`, `backend/hf-space/services/reports_analysis_service.py`.
- **Criterii**: șters; backend OK.
- **Dependențe**: nimic.

### Pas 4.3 — Șterge `services/circadian_nutrition_service.py`
- **Scop**: variantă alternativă nefolosită.
- **Unde**: `backend/services/circadian_nutrition_service.py`, `backend/hf-space/services/circadian_nutrition_service.py`.
- **Criterii**: șters; backend OK.
- **Dependențe**: nimic.

### Pas 4.4 — Curățare `hrv_service.py` dead code
- **Scop**: `_bandpass_filter` apelează `np.signal.lfilter` (inexistent), `_bandpass_numpy` importă `scipy.signal` (neinstalat).
- **Unde**: `backend/services/hrv_service.py`, `backend/hf-space/services/hrv_service.py`.
- **Ce face agentul**: verifică ce funcție e folosită efectiv, șterge dead code, decide scipy.
- **Criterii**: niciun import mort; HRV funcționează cu deps instalate.
- **Dependențe**: nimic.

### Pas 4.5 — Șterge `models/model_final.keras` + `class_names_101.json`
- **Scop**: model mort 69.8 MB + JSON nefolosit.
- **Unde**: `backend/models/`, `backend/hf-space/models/`.
- **Criterii**: fișiere șterse; ~70 MB eliberat; niciun referință rămasă.
- **Dependențe**: nimic.

### Pas 4.6 — Decizie: endpoint-uri backend nefolosite
- **Scop**: `/solar-window`, `/hrv/process`, `/allostatic/*` nu sunt apelate din frontend.
- **Unde**: `backend/main.py`, `backend/hf-space/app.py`, `backend/services/*`.
- **Ce face agentul**: decide păstrare vs eliminare. Șterge sau unește cod. Actualizează README.
- **Criterii**: decizie documentată; cod consecvent; README actualizat.
- **Dependențe**: Pas 3.2.

### Pas 4.7 — Verifică `venv/` nu e în git
- **Scop**: `backend/venv/` prezent pe disk.
- **Unde**: `backend/.gitignore`, git index.
- **Ce face agentul**: `git ls-files backend/venv/` → dacă returnează ceva, `git rm -r --cached`. Verifică `.gitignore`.
- **Criterii**: `git ls-files backend/venv/` gol; `venv/` în `.gitignore`.
- **Dependențe**: nimic.

### Pas 4.8 — Actualizează `backend/README.md`
- **Scop**: README listează 5 rute dar sunt 19+.
- **Unde**: `backend/README.md`.
- **Ce face agentul**: listează toate rutele finale cu metoda, path, descriere, format. Documentează env vars, setup, deploy, modele ML.
- **Criterii**: README sincronizat cu codul.
- **Dependențe**: Pas 4.6.

---

## FAZA 5 — UI/Design consistență

### Pas 5.1 — Consistență header/padding între pagini
- **Scop**: padding inconsistent între pagini.
- **Unde**: `frontend/app/bio-age/page.tsx`, `frontend/app/protocol/page.tsx`, `frontend/app/experiments/page.tsx`, `frontend/app/profile/edit/page.tsx`, `frontend/app/profile/goals/page.tsx`.
- **Ce face agentul**: stabilește convenție (pagini cu Navbar: `pt-10` + `space-y-2`; pagini cu back: `pt-14` + `space-y-2`). Aplică pe toate paginile.
- **Criterii**: toate paginile respectă convenția; niciun jump vizual.
- **Dependențe**: nimic.

### Pas 5.2 — Accesibilitate: contrast + focus rings + aria-labels
- **Scop**: `text-zinc-400` pe fundal glass → WCAG AA FAIL. Lipsă focus rings. Butoane icon fără aria-label.
- **Unde**: toate componentele frontend, `frontend/app/globals.css`.
- **Ce face agentul**: schimbă `text-zinc-400` în `text-zinc-600/700` pe fundal glass. Adaugă `focus-visible:ring-2` global. Adaugă aria-labels pe butoane icon.
- **Criterii**: Lighthouse Accessibility > 90; contrast OK; navigare tastură funcțională.
- **Dependențe**: nimic.

### Pas 5.3 — Dark mode: decide și implementează sau elimină
- **Scop**: dark mode definit dar nefolosit.
- **Unde**: `frontend/app/globals.css`, `frontend/app/layout.tsx`.
- **Ce face agentul**: elimină definițiile `.dark` pentru v1 (recomandat) sau convertește la CSS vars + `next-themes`.
- **Criterii**: cod consistent cu decizia; niciun CSS mort.
- **Dependențe**: nimic.

### Pas 5.4 — Elimină fallback image `/images/pizza.jpg`
- **Scop**: fallback ciudat pentru orice masă fără imagine.
- **Unde**: `frontend/components/journal/MealTimeline.tsx`.
- **Ce face agentul**: înlocuiește cu placeholder neutru (icon fork pe fundal emerald) sau primul cuvânt din titlu.
- **Criterii**: fallback neutru, nu pizza.
- **Dependențe**: nimic.

### Pas 5.5 — GOAL_LABELS inconsistente cu onboarding
- **Scop**: `ProfileHeader` are `maintain_weight` dar onboarding folosește `maintain`.
- **Unde**: `frontend/components/profile/ProfileHeader.tsx`, `frontend/app/profile/edit/page.tsx`.
- **Ce face agentul**: creează un singur `GOAL_LABELS` central cu toate valorile + label-uri românești. Folosește peste tot.
- **Criterii**: toate goal-urile afișează label românesc corect; un singur sursă de adevăr.
- **Dependențe**: nimic.

### Pas 5.6 — `getInitials` crash pe nume cu spații duble
- **Scop**: `" Alex "` → crash.
- **Unde**: `frontend/components/profile/ProfileHeader.tsx`.
- **Ce face agentul**: fix cu `name.trim().split(/\s+/).filter(Boolean)`. Fallback "U" dacă fără inițiale.
- **Criterii**: `getInitials(" Alex ")` → "A"; `getInitials("")` → "U".
- **Dependențe**: nimic.

---

## FAZA 6 — Testare & validare pre-publicare

### Pas 6.1 — Typecheck + lint + build curat
- **Unde**: frontend + backend.
- **Ce face agentul**: `npx tsc --noEmit` + `npm run lint` + `npm run build` (frontend). `ruff`/`flake8` (backend). Rezolvă toate warning-urile.
- **Criterii**: 0 erori, 0 warning-uri, build OK.
- **Dependențe**: toate fazele 1-5.

### Pas 6.2 — Testare end-to-end manuală pe deploy preview
- **Unde**: Vercel preview + HF Space.
- **Ce face agentul**: testează 12 flow-uri complete (onboarding, home, scan, journal, bio-age, reports, protocol, experiments, profile, AI chat, Sabbath, offline).
- **Criterii**: toate flow-urile funcționează fără eroare.
- **Dependențe**: Pas 6.1.

### Pas 6.3 — Testare pe device-uri reale (mobile)
- **Unde**: iPhone Safari + Android Chrome.
- **Ce face agentul**: PWA install, camera, notificări, scroll, viewport.
- **Criterii**: PWA instalabil; camera funcțională; UI accesibil.
- **Dependențe**: Pas 6.2.

### Pas 6.4 — Verificare Lighthouse audit
- **Unde**: Vercel production URL.
- **Ce face agentul**: Performance > 80, Accessibility > 90, Best Practices > 90, SEO > 90, PWA > 90.
- **Criterii**: toate scorurile peste target.
- **Dependențe**: Pas 6.2.

### Pas 6.5 — Verificare SEO basics
- **Unde**: `frontend/app/layout.tsx`.
- **Ce face agentul**: adaugă Open Graph, Twitter Cards, `opengraph-image`.
- **Criterii**: OG preview corect; Twitter Card corect.
- **Dependențe**: Pas 2.9.

### Pas 6.6 — Verificare securitate cu checklist
- **Unde**: tot codul.
- **Ce face agentul**: OWASP top 10 relevant. `npm audit` + `pip-audit`. Prisma parametrized queries. XSS check (markdown în ChatAssistant).
- **Criterii**: niciuna din cele 10 categorii cu issue; 0 high/critical.
- **Dependențe**: toate fazele 0-1.

### Pas 6.7 — Verificare monitoring & logging
- **Unde**: frontend + backend.
- **Ce face agentul**: integrează Sentry sau logging structurat. `request_id` propagat.
- **Criterii**: erori de producție vizibile în dashboard.
- **Dependențe**: Pas 1.2.

---

## FAZA 7 — Publicare & post-publicare

### Pas 7.1 — Deploy pe producție
- **Unde**: git, Vercel, HF Space.
- **Ce face agentul**: merge pe main, Vercel auto-deploy, HF Space git push, smoke test.
- **Criterii**: deploy reușit; `/health` 200; flow-uri principale OK.
- **Dependențe**: toate fazele 0-6.

### Pas 7.2 — Rotație finală chei API (post-deploy)
- **Unde**: Ollama Cloud, Prisma, Vercel Blob.
- **Criterii**: chei noi funcționale; vechi revocate.
- **Dependențe**: Pas 7.1.

### Pas 7.3 — Documentație finală
- **Unde**: `README.md` (root, frontend, backend).
- **Criterii**: developer nou poate setup + run din README.
- **Dependențe**: Pas 7.1.

### Pas 7.4 — Backup DB + configurare prune
- **Unde**: Prisma Accelerate.
- **Criterii**: backup funcțional; prune configurat.
- **Dependențe**: Pas 7.1.

### Pas 7.5 — Setup analytics (opțional)
- **Unde**: Vercel Analytics / Plausible / PostHog.
- **Criterii**: analytics vizibile; GDPR compliant.
- **Dependențe**: Pas 7.1.

---

## Rezumat execuție

**Total: 64 pași.**

### Paralelizare recomandată

**Sprint 1 (zilele 1-2) — Securitate + Backend blockere**:
- Paralel: Pas 0.1, 0.4, 1.1, 1.2, 4.1-4.5, 4.7
- Secvențial după 0.1: 0.2, 0.3, 0.5
- Secvențial după 1.2: 1.3, 1.4, 1.5, 1.6, 1.7

**Sprint 2 (zilele 3-4) — Frontend blockere**:
- Paralel: 2.1, 2.4, 2.5, 2.8, 2.10, 2.12, 2.13, 2.14, 2.15, 2.16, 2.18, 2.20
- Secvențial după 2.1: 2.2, 2.3
- Secvențial după 2.10: 2.11
- Paralel: 2.6, 2.7, 2.9, 2.17, 2.19, 2.21, 2.22

**Sprint 3 (zilele 5-6) — Backend funcționalitate + UI**:
- Paralel: 3.1, 3.3, 4.6, 4.8, 5.1, 5.2, 5.4, 5.5, 5.6
- Secvențial: 3.2 (după 4.6), 5.3 (decizie)

**Sprint 4 (ziua 7) — Testare + Publicare**:
- Secvențial: 6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 7.1 → 7.2 → 7.3 → 7.4 → 7.5