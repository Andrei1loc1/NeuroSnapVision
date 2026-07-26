# Home Page Redesign & North Star Coach — Design Spec

**Data:** 2026-07-07
**Status:** Approved
**Sursă:** Brainstorming cu Gemini + Andrei

---

## 1. Problema

### Home Page
- 9 carduri aruncate una sub alta, fără ierarhie
- Utilizatorul se pierde în detalii înainte să vadă big picture-ul
- Prea multe informații la prima vedere — overwhelming

### North Star
- E doar o propoziție într-un banner mic, decorativ
- Nu ghidează utilizatorul, nu-l ajută să atingă direcția
- Nu există conexiune între North Star și acțiunile zilnice

---

## 2. Soluția: "Busola Zilnică"

North Star-ul devine **motorul aplicației**. Totul gravitează în jurul lui. Home page-ul e structurat pe 5 niveluri, de la cel mai mic efort mental la cel mai mare.

### Principii
- **Regula Călătoriei Zilnice** — ordine cronologică + efort mental crescător
- **Ancorare emoțională** — utilizatorul vede DE CE folosește aplicația înainte de orice metrică
- **O singură acțiune pe zi** — nu o listă, ci o direcție clară

---

## 3. Structura Home Page (5 Niveluri)

| Nivel | Componentă | Descriere | Stare |
|-------|-----------|-----------|-------|
| **1** | **Coach Zilnic** | O propoziție AI: „Azi, pentru [North Star], concentrează-te pe [dimensiune]." | **NOU** |
| **2** | **Acțiunea Zilei** | Cea mai mare pârghie de azi (din DailyLeverage, rescrisă scurt) | **Modificat** |
| **3** | **Dashboard 2×2** | 4 carduri mici în grilă: BioAge, Sleep, Nutrition, Alignment | **NOU** |
| **4** | **Intervenție** | Breathing, articole științifice (WisdomCard compact) | **Păstrat** |
| **5** | **Reflecția de Seară** | Doar după ora 20:00, jos de tot | **Păstrat** |

### Ce dispare de pe Home

| Componentă | Unde se mută |
|-----------|-------------|
| `SolarWindowIndicator` | Pagina BioAge (`/bio-age`) |
| `StressStateBadge` + buton HRV | Pagina BioAge (`/bio-age`) |
| `NorthStarBanner` | Înlocuit de Coach Zilnic (Nivel 1) |
| `MeaningAlignmentCard` (ca card separat) | Devine unul din cele 4 carduri din grila 2×2 |
| `WisdomCard` (expandat) | Rămâne la Nivel 4 dar compact (1-2 rânduri) |
| `SleepScoreCard` (ca card separat) | Devine unul din cele 4 carduri din grila 2×2 |
| `NutritionCard` (ca card separat) | Devine unul din cele 4 carduri din grila 2×2 |

---

## 4. Coach-ul Zilnic (Nivel 1) — Detalii

### Ce este
O propoziție generată de AI în fiecare dimineață, care leagă North Star-ul de o acțiune concretă.

### Cum funcționează

1. **Când se generează:** La prima deschidere a aplicației în fiecare zi (cache 24h în localStorage)
2. **Ce primește AI-ul (prompt):**
   - North Star-ul utilizatorului
   - Scorurile actuale (bioAge, sleep, nutrition, alignment)
   - Dimensiunea cu cel mai slab scor
3. **Ce returnează:** O singură propoziție, maxim 100 caractere
4. **Fallback (dacă AI-ul nu răspunde):** O propoziție predefinită bazată pe cea mai slabă dimensiune

### Exemple de output

| North Star | Dimensiune slabă | Coach |
|-----------|-----------------|-------|
| „Să fiu prezent pentru familia mea la 80 de ani" | sleep | „Azi, pentru familia ta, concentrează-te pe somn. Culcă-te la 22:30." |
| „Să am energia să călătoresc și să descopăr lumea" | movement | „Azi, pentru energia ta, mișcarea e prioritatea. 20 min de mers." |
| „Să am claritatea mentală să îmi construiesc visul" | nutrition | „Azi, pentru claritatea ta mentală, evită zahărul după ora 16." |

### UI
- Card compact, imediat sub header
- Fundal gradient subtil (amber/emerald)
- Icon North Star (stea)
- Text centrat, font 14px, medium weight
- Fără butoane — e informațional

### API
- **Endpoint:** `POST /api/purpose/daily-coach`
- **Input:** `{ northStar, scores: { bioAge, sleep, nutrition, alignment } }`
- **Output:** `{ coach: "propoziția", dimension: "sleep" }`
- **Cache:** localStorage cu cheia `neurosnap_daily_coach` + data

---

## 5. Dashboard 2×2 (Nivel 3) — Detalii

### Cele 4 carduri

| Poziție | Metrică | Ce arată | Tap duce la |
|---------|---------|----------|------------|
| Stânga sus | **Vârsta Stil de Viață** | BioAge (număr mare) + trend săgeată | `/bio-age` |
| Dreapta sus | **Odihnă** | Sleep score + ore dormite | `/reports` |
| Stânga jos | **Alimentație** | Calorii consumate + proteine | `/journal` |
| Dreapta jos | **Aliniere de Sens** | Scor aliniere (număr) + mini ring | Recalculează |

### UI
- Grid 2×2 cu gap 8px
- Fiecare card: 50% lățime, înălțime fixă (~100px)
- Icon + titlu mic + valoare mare + subtitlu
- Fundal glass-card, border subtil
- Tap pe card duce la pagina dedicată

---

## 6. Acțiunea Zilei (Nivel 2) — Modificări

### Ce se schimbă față de DailyLeverageCard actual
- **Fără pași expandați** — doar titlu + buton „Făcut"
- **Fără info tooltip** — destul de clar
- **Fără secțiunea de eficacitate istorică** — se mută pe `/bio-age`
- **Text rescris** să fie mai scurt, mai direct
- **Butonul „Făcut"** persistă în localStorage (reset la miezul nopții)

---

## 7. Plan de Implementare

### Pas 1: Coach-ul Zilnic (backend + frontend)
- [ ] Creează `POST /api/purpose/daily-coach` — trimite scoruri + northStar la Ollama Cloud, primește propoziția
- [ ] Creează componenta `DailyCoachCard` — afișează propoziția, cache 24h
- [ ] Integrează în `page.tsx` la Nivel 1

### Pas 2: Dashboard 2×2
- [ ] Creează componenta `DashboardGrid` — grid 2×2 cu 4 carduri
- [ ] Creează sub-componentele: `BioAgeMiniCard`, `SleepMiniCard`, `NutritionMiniCard`, `AlignmentMiniCard`
- [ ] Integrează în `page.tsx` la Nivel 3

### Pas 3: Restructurare Home Page
- [ ] Reordonează componentele în `page.tsx` conform celor 5 niveluri
- [ ] Mută `SolarWindowIndicator` pe `/bio-age`
- [ ] Mută `StressStateBadge` + buton HRV pe `/bio-age`
- [ ] Elimină `NorthStarBanner` (înlocuit de Coach)
- [ ] Elimină cardurile separate `SleepScoreCard`, `NutritionCard`, `MeaningAlignmentCard` (acum în grid)
- [ ] Compactează `WisdomCard` la 1-2 rânduri

### Pas 4: Acțiunea Zilei
- [ ] Simplifică `DailyLeverageCard` — fără expand, fără istoric
- [ ] Adaugă persistență „Făcut" în localStorage

### Pas 5: Testare & Deploy
- [ ] Testează coach-ul cu diverse North Star-uri
- [ ] Testează grid-ul pe mobile (375px)
- [ ] Deploy pe Vercel

---

## 8. Ce NU se schimbă

- `HomeHeader` — rămâne la fel
- `ChatAssistant` — rămâne la fel
- `EveningReflection` — rămâne la fel (doar repoziționat)
- `BreathingPause` — rămâne la fel
- `HrvScanner` — rămâne la fel
- Toate paginile secundare (`/bio-age`, `/journal`, `/protocol`, `/reports`, `/profile`) — neschimbate
- Bara de navigare inferioară — neschimbată
