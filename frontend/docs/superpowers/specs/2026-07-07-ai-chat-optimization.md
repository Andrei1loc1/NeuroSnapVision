# AI Chat Optimization Plan — Nivel Top

**Data:** 2026-07-07
**Status:** Draft

---

## 1. Problema

AI Chat-ul nu e la nivel de top. Probleme identificate:

| Problemă | Impact |
|----------|--------|
| System prompt de 80+ linii | 2-3s extra latență per mesaj, costuri mari |
| Date hardcodate (upfCount, workoutCount, avgStress, sleepHours) | AI-ul răspunde cu date false |
| Contextul se fetch-uiește la page load dar fără cache | Refetch inutil la fiecare refresh |
| Prompt-ul include studii științifice (knowledge base) | Adaugă 500+ tokeni extra |

---

## 2. Soluția

### 2.1 Prompt Compact (15 linii max)

**Înainte (80+ linii):**
```
Ești un logoterapeut în tradiția lui Viktor Frankl...
Principiile tale fundamentale:
1. Fiecare răspuns ancorează datele în SENS...
2. Nu folosești niciodată limbaj punitiv...
3. Când utilizatorul a avut o zi mai puțin optimă...
... (60+ linii)
```

**După (15 linii):**
```
Ești un coach de longevitate în NeuroSnap Vision. Răspunzi în română, cald, scurt (3-4 propoziții).

REGULI:
- Ancorează fiecare răspuns în North Star-ul utilizatorului
- Fără limbaj punitiv. Fără vinovăție. Blând și orientat spre sens.
- Nu menționa calorii/grame decât dacă utilizatorul întreabă explicit
- Citează studiile natural în text dacă sunt relevante
- Dacă nu ai date suficiente, spui sincer

DATE UTILIZATOR:
[context compact]

NORTH STAR: [northStar]
```

**Economie:** ~500 tokeni mai puțin per request = 1-2s mai rapid.

### 2.2 Date Reale (nu hardcodate)

| Câmp | Sursă | Cum |
|------|-------|-----|
| `upfCount` | Prisma — numără mesele cu `mealType = SNACK` sau tag UPF | Query simplu |
| `workoutCount` | Prisma — `WorkoutLog` count pe azi | Query simplu |
| `avgStress` | Prisma — media `stressLevel` din `HrvReading` pe azi | Query simplu |
| `sleepHours` | Prisma — `DailyProtocol.sleepHours` sau calcul din `sleepTime` | Query simplu |

**Implementare:** Adaugă un endpoint `GET /api/ai-chat/context` care returnează toate datele într-un singur call.

### 2.3 Cache Context (5 minute)

Contextul se schimbă rar (doar când loghezi o masă, un workout, sau un HRV). Nu are sens să-l fetch-uim la fiecare page load.

**Soluție:** Cache în `useState` + `useRef` cu TTL 5 minute. După 5 minute, refetch automat.

### 2.4 Elimină Knowledge Base din Prompt

Studiile științifice adaugă 500+ tokeni și rareori sunt relevante pentru întrebarea utilizatorului. Mută-le într-un tool call opțional.

**Soluție:** Scoate `searchKnowledgeBase` din system prompt. Adaugă un buton "Caută studii" în chat care face un call separat.

---

## 3. Plan de Implementare

### Pas 1: Endpoint context dedicat
- [ ] Creează `GET /api/ai-chat/context` — returnează toate datele userului într-un singur JSON
- [ ] Include: bioAge, protocol, totals, upfCount, workoutCount, avgStress, sleepHours
- [ ] Toate query-urile în paralel (Promise.all)

### Pas 2: Optimizează prompt-ul
- [ ] Reduce system prompt la 15 linii max
- [ ] Scoate knowledge base din prompt
- [ ] Păstrează doar regulile esențiale + date + northStar

### Pas 3: Cache context în frontend
- [ ] Adaugă `useRef` cu TTL 5 minute în `useAIChat`
- [ ] Refetch doar dacă cache-ul a expirat
- [ ] Fallback la datele din `useBioAge` dacă endpoint-ul e slow

### Pas 4: Testare & Deploy
- [ ] Testează latența (time-to-first-token)
- [ ] Testează acuratețea datelor
- [ ] Deploy

---

## 4. Metrici Țintă

| Metrică | Înainte | Țintă |
|---------|---------|-------|
| Time-to-first-token | 3-5s | < 2s |
| Prompt tokeni | ~800 | ~300 |
| Date hardcodate | 4 câmpuri | 0 |
| Context cache | Nu | 5 min TTL |
