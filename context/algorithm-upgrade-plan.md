# NeuroSnap — Algorithm Upgrade Plan
## Bazat pe research 2025-2026 (DunedinPACE, PhenoAge, Peter Attia, Frontiers in Aging)

---

## Problema fundamentală

Algoritmul curent e **inventat, nu calibrat**:
- Sigmoid-ul (`0.3 * tanh(x * 1.2)`) — constante scoase din aer
- Ponderile dimensiunilor nu reflectă hazard ratios reale
- Lipsește VO2 max (cel mai puternic predictor al longevității)
- Lipsește inflammaging (driverul #1 al aging-ului)
- Pace of aging e un raport static, nu o viteză reală
- Marginal gain analysis presupune +10 puncte uniform (fără dose-response curves)
- Zero feedback loop (recomandă → nu verifică niciodată dacă a funcționat)

---

## Ce trebuie implementat

### PHASE 1 — CRITIC (fundamentul algoritmic)

#### 1.1 Hazard Ratio Mapping (înlocuiește sigmoid-ul)
**Fișier:** `backend/services/bio_age_service.py` — funcția `_composite_to_bio_age()`

**Ce e acum:**
```python
x = (composite - 60) / 40
multiplier = 1.0 - 0.3 * math.tanh(x * 1.2)
bio_age = chrono_age * multiplier
```

**Ce trebuie să fie:**
```python
# Fiecare dimensiune are un hazard ratio (HR) din literatură:
# - VO2 max low→below-avg: HR 0.50 (50% mortality reduction)
# - Sleep 7-8h vs <6h: HR 0.70-0.85
# - MIND diet top vs bottom tertile: HR 0.75
# - 150min/week activity vs sedentary: HR 0.70
# - Social isolation: HR 1.50
# - High stress: HR 1.20-1.40

# Composite = weighted product of HRs → pace multiplier
# bio_age = chrono_age * pace_multiplier
```

**Surse:**
- Mandsager K et al. (2018) — VO2 max & all-cause mortality, JAMA
- Cappuccio FP et al. (2010) — Sleep duration & mortality, Sleep
- Morris MC et al. (2015) — MIND diet & Alzheimer's, Alzheimers Dement
- Holt-Lunstad J et al. (2010) — Social relationships & mortality, PLoS Med
- Epel ES et al. (2004) — Telomere shortening & stress, PNAS

#### 1.2 VO2 max Estimation
**Fișier nou:** `backend/services/vo2max_service.py`

**Ce trebuie:**
- Estimează VO2 max din datele de workout existente (tip, RPE, durată) + vârstă + sex
- Formulă: `VO2max_proxy = f(zone2_vol_saptamanal, hiit_freq, age, sex, bmi_proxy)`
- Fără wearables — doar matematică
- Output: scor 0-100 + valoare estimată în ml/kg/min

**Surse:**
- Uth N et al. (2004) — Estimation of VO2max from RPE, EJAP
- ACSM Guidelines (2021) — MET to VO2max conversion

#### 1.3 Inflammaging Score
**Fișier nou:** `backend/services/inflammaging_service.py`

**Ce trebuie:**
- Estimează inflamația cronică low-grade din proxy disponibili:
  - Calitate somn (recovery < 3 = +inflam)
  - Alimente procesate (fried, pastries, fast food count)
  - Overtraining (HIIT > 3x/săpt fără recovery)
  - Stres (evening stress > 4 = +inflam)
  - Omega-3 proxy (fish meals/săptămână)
  - Oral health (zile fără periaj = +inflam)
- Output: scor 0-100 (100 = inflamație minimă)

**Surse:**
- Franceschi C et al. (2018) — Inflammaging: a new immune-metabolic viewpoint, Nat Rev Endocrinol
- Furman D et al. (2019) — Chronic inflammation in the etiology of disease, Nat Med
- Frontiers in Aging (2026) — Mitochondrial Transcription Factor A & Inflammaging

---

### PHASE 2 — HIGH (precizie și diferențiere)

#### 2.1 Pace of Aging (DunedinPACE-style)
**Fișier:** `backend/services/bio_age_service.py` — funcția `_compute_pace()`

**Ce e acum:**
```python
pace = biological_age / chronological_age  # raport static
```

**Ce trebuie să fie:**
```python
# Slope-ul composite score pe 30-90 zile
# Convertit în "ani biologici / an calendaristic"
# Afișat ca "îmbătrânești cu 0.85x viteza normală luna asta"
# Cu istoric: regresie liniară pe ultimele 30 snapshot-uri
# Fără istoric: estimare din scorurile curente vs baseline teoretic
```

**Surse:**
- Belsky DW et al. (2022) — DunedinPACE, a DNA methylation biomarker of the pace of aging, eLife
- Elliott ML et al. (2021) — Disparities in the pace of biological aging, Nat Aging

#### 2.2 Protein Timing Score
**Fișier:** `backend/services/nutrition_service.py` — funcție nouă

**Ce trebuie:**
- Nu doar grame totale, ci distribuție per masă
- Leucine threshold: 2.5-3g leucine/meal ≈ 25-40g protein/meal
- Mese cu <20g protein = penalizare
- Distribuție ideală: 3-4 mese cu >25g > 1-2 mese cu >50g
- Output: scor 0-100 integrat în nutrition_score

**Surse:**
- Layman DK et al. (2015) — Protein quantity and quality at levels above RDA, Am J Clin Nutr
- Areta JL et al. (2013) — Timing and distribution of protein ingestion, J Physiol
- Peter Attia — Protein intake framework (2g/kg, distributed)

#### 2.3 Dose-Response Curves per Dimensiune
**Fișier:** `backend/services/bio_age_service.py` — funcția `_find_leverage_point()`

**Ce e acum:**
```python
improved[dim] = min(improved[dim] + 10, 100)  # +10 uniform pentru toate
```

**Ce trebuie să fie:**
```python
# Fiecare dimensiune are o curbă diferită:
# - Sleep: steep 30→70, flat 70→100 (diminishing returns)
# - Movement: aproape liniară
# - Nutrition: diminishing returns după 80
# - ANS: steep 20→60, gradual după
# - Light: steep 30→80, flat după
# - Subjective: liniară

# Marginal gain = derivata curbei la scorul curent
# Nu +10 puncte, ci +1 deviație standard sau +10% din gap
```

**Surse:**
- Hirshkowitz M et al. (2015) — National Sleep Foundation sleep duration recommendations
- Warburton DER et al. (2006) — Health benefits of physical activity, CMAJ

#### 2.4 Social Connection Metric
**Fișier:** `backend/services/bio_age_service.py` — integrat în `_score_subjective()`

**Ce trebuie:**
- Input săptămânal: "Cât de conectat social te-ai simțit?" (1-5)
- HR 1.5 pentru izolare socială
- Integrat în dimensiunea "subjective" cu pondere 20%

**Surse:**
- Holt-Lunstad J et al. (2010) — Social relationships and mortality risk, PLoS Med
- Yang YC et al. (2016) — Social isolation and mortality, PNAS

#### 2.5 Allostatic Load (Stres Cumulativ)
**Fișier:** `backend/services/bio_age_service.py` — integrat în `_score_ans()`

**Ce trebuie:**
- Din evening stress zilnic:
  - Media pe 7 zile
  - Trend (crește/scade)
  - Vârfuri (>4 în zile consecutive = penalizare)
- Integrat în ANS score cu pondere 30%

**Surse:**
- McEwen BS (1998) — Stress, adaptation, and disease, NEJM
- Epel ES et al. (2004) — Accelerated telomere shortening in response to life stress, PNAS

---

### PHASE 3 — MEDIUM (diferențiere competitivă)

#### 3.1 Hormesis Tracker
**Fișier nou:** `backend/services/hormesis_service.py`

**Ce trebuie:**
- Inputuri noi (opționale, 1-2 tap-uri):
  - Cold exposure (da/nu azi)
  - Heat/sauna (da/nu azi)
  - Eating window >14h (fasting)
- Fiecare contribuie la scorul de longevitate prin sirtuins/autophagy
- Output: hormesis_score 0-100, integrat ca bonus în composite

**Surse:**
- Laukkanen JA et al. (2018) — Sauna bathing and cardiovascular mortality, JAMA
- Buijze GA et al. (2016) — Cold exposure and immune response, PLoS One
- Longo VD et al. (2014) — Fasting: molecular mechanisms, Cell Metab

#### 3.2 Oral Health Input
**Fișier:** `backend/services/bio_age_service.py` — integrat în inflammaging

**Ce trebuie:**
- Input binar zilnic: "Te-ai spălat pe dinți + ață dentară?" (da/nu)
- Legat de Alzheimer, CVD, inflamație sistemică
- Contribuie la inflammaging_score

**Surse:**
- Dominy SS et al. (2019) — Porphyromonas gingivalis in Alzheimer's, Sci Adv
- Sanz M et al. (2018) — Periodontitis and cardiovascular diseases, J Clin Periodontol

#### 3.3 Intervention Efficacy Tracking (Feedback Loop)
**Fișier:** `backend/services/bio_age_service.py` — funcție nouă

**Ce trebuie:**
- Store: `{date, dimension, action, score_before}`
- După 14-30 zile: compară score_now vs score_before
- Arată: "Sleep +17 puncte după rutina de culcare → -0.8 ani bio"
- Integrat în DailyLeverageCard: "Acum 2 săptămâni ți-am recomandat X. Ai făcut-o? Somnul tău a crescut de la 45→62."

#### 3.4 Circadian Alignment Score (extindere)
**Fișier:** `backend/services/circadian_service.py` — extindere

**Ce trebuie adăugat:**
- Light exposure timing (input: "Te-ai expus la lumină naturală în 30min de la trezire?")
- Caffeine cutoff (input: "Ultima cafeină înainte de ora 14?")
- Screen time cutoff (input: "Ecrane oprite cu 1h înainte de somn?")
- Integrat în light_score

**Surse:**
- Czeisler CA et al. (2013) — Circadian disruption and health, Nature
- Chang AM et al. (2015) — Evening use of light-emitting eReaders, PNAS

---

### PHASE 4 — LOW (polish)

#### 4.1 Organ Age Recalibration
**Fișier:** `backend/services/bio_age_service.py` — funcția `_compute_organ_ages()`

**Ce e acum:**
```python
penalty = avg_gap * 0.08  # arbitrar
```

**Ce trebuie:**
- Penalty bazat pe hazard ratios specifice per organ
- Brain: sleep + subjective + inflammaging
- Cardiovascular: VO2 max + movement + ANS
- Metabolic: nutrition + circadian + protein timing
- Immune: sleep + inflammaging + hormesis

#### 4.2 Ponderi Recalibrate
**Fișier:** `backend/services/bio_age_service.py` — constanta `WEIGHTS`

**Ce e acum:**
```python
WEIGHTS = {
    "nutrition": 0.25, "sleep": 0.20, "ans": 0.15,
    "movement": 0.15, "light": 0.10, "subjective": 0.15,
}
```

**Ce trebuie:**
```python
WEIGHTS = {
    "movement": 0.25,    # VO2 max = cel mai puternic predictor
    "nutrition": 0.20,   # MIND diet + protein timing
    "sleep": 0.20,       # ok
    "subjective": 0.15,  # include social + stress
    "ans": 0.10,         # HRV proxy slab
    "light": 0.10,       # circadian
}
```

---

## Inputuri noi necesare (UI)

| Input | Unde | Tip | Frecvență |
|---|---|---|---|
| Social connection | Protocol evening | 1-5 scale | Săptămânal |
| Cold exposure | Protocol evening | da/nu | Zilnic (opțional) |
| Heat/sauna | Protocol evening | da/nu | Zilnic (opțional) |
| Oral health | Protocol evening | da/nu | Zilnic |
| Light exposure morning | Protocol morning | da/nu | Zilnic (opțional) |
| Caffeine cutoff | Protocol evening | da/nu | Zilnic (opțional) |
| Screen cutoff | Protocol evening | da/nu | Zilnic (opțional) |

**Total inputuri noi:** 7 (4 binare, 1 scale, 2 opționale binare)
**Tap-uri adiționale:** ~3-4 extra pe evening check-in

---

## Ordinea implementării

### Sprint 1 — Algoritmul core (3-4 ore)
1. Hazard Ratio Mapping (înlocuiește sigmoid-ul)
2. VO2 max Estimation
3. Inflammaging Score
4. Ponderi recalibrate

### Sprint 2 — Precizie (2-3 ore)
5. Pace of Aging (DunedinPACE-style)
6. Protein Timing Score
7. Dose-Response Curves
8. Social Connection + Allostatic Load

### Sprint 3 — Diferențiere (2-3 ore)
9. Hormesis Tracker
10. Oral Health Input
11. Intervention Feedback Loop
12. Circadian Alignment extindere

### Sprint 4 — Polish (1-2 ore)
13. Organ Age Recalibration
14. Inputuri noi în UI (Protocol evening/morning)
15. TypeScript types update
16. Test end-to-end

---

## Fișiere afectate

### Backend (Python)
| Fișier | Modificare |
|---|---|
| `backend/services/bio_age_service.py` | Refacere majoră: sigmoid, ponderi, pace, leverage, organ ages |
| `backend/services/vo2max_service.py` | **NOU** — VO2 max estimation |
| `backend/services/inflammaging_service.py` | **NOU** — Inflammaging score |
| `backend/services/hormesis_service.py` | **NOU** — Hormesis tracker |
| `backend/services/nutrition_service.py` | Adăugare protein timing score |
| `backend/services/circadian_service.py` | Extindere cu light/caffeine/screen inputs |
| `backend/services/protocol_service.py` | Adăugare câmpuri noi (social, oral, cold, heat, light, caffeine, screen) |
| `backend/main.py` | Endpoint-uri noi (dacă e nevoie) |

### Frontend (TypeScript/Next.js)
| Fișier | Modificare |
|---|---|
| `frontend/lib/types/index.ts` | Tipuri noi: InflammagingScore, VO2maxEstimate, HormesisScore, InterventionEfficacy |
| `frontend/lib/api/bio-age.ts` | Funcții API noi |
| `frontend/hooks/useBioAge.ts` | Integrare date noi |
| `frontend/components/home/BioAgeCard.tsx` | Pace of aging display nou |
| `frontend/components/home/DailyLeverageCard.tsx` | Feedback loop display |
| `frontend/app/protocol/page.tsx` | Inputuri noi în evening/morning check-in |
| `frontend/app/bio-age/page.tsx` | Noi metrici în deep-dive |

---

## Metrici de succes

- [ ] Bio-age se mișcă realist (nu sare 5 ani într-o zi)
- [ ] Pace of aging arată trend pe 30-90 zile
- [ ] VO2 max estimation produce valori plauzibile (25-55 ml/kg/min)
- [ ] Inflammaging score răspunde la inputuri reale (processed food, stress, sleep)
- [ ] Marginal gain analysis alege dimensiuni diferite în funcție de dose-response curves
- [ ] Feedback loop arată impactul intervențiilor trecute
- [ ] Toate inputurile noi sunt opționale (nu strică flow-ul dacă lipsesc)
- [ ] Backend-ul pornește fără erori (tensorflow try/except păstrat)
- [ ] TypeScript compilează fără erori
