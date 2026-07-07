# Graph Report - C:\Users\Andrei\Documents\NeuroSnap Vision\backend  (2026-06-27)

## Corpus Check
- Corpus is ~25,727 words - fits in a single context window. You may not need a graph.

## Summary
- 292 nodes · 463 edges · 33 communities (27 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Bio-Age Computation|Bio-Age Computation]]
- [[_COMMUNITY_API Routes & FastAPI|API Routes & FastAPI]]
- [[_COMMUNITY_Nutrition & Scoring|Nutrition & Scoring]]
- [[_COMMUNITY_Prediction & Classification|Prediction & Classification]]
- [[_COMMUNITY_Services Infrastructure|Services Infrastructure]]
- [[_COMMUNITY_Hormesis & VO2Max|Hormesis & VO2Max]]
- [[_COMMUNITY_Protocol & Circadian|Protocol & Circadian]]
- [[_COMMUNITY_Agent System|Agent System]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Docker & Config|Docker & Config]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `_load_services()` - 15 edges
2. `Bio Age Computation` - 12 edges
3. `compute_bio_age()` - 10 edges
4. `_compute_all_dimensions()` - 10 edges
5. `score_day()` - 10 edges
6. `compute_bio_age()` - 10 edges
7. `_compute_all_dimensions()` - 10 edges
8. `score_day()` - 10 edges
9. `FastAPI App (main.py)` - 9 edges
10. `get_weekly_movement_score()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Algorithm Upgrade Plan` --cites--> `Inflammaging Score`  [EXTRACTED]
  context/algorithm-upgrade-plan.md → backend/services/inflammaging_service.py
- `Algorithm Upgrade Plan` --cites--> `Hormesis Tracker`  [EXTRACTED]
  context/algorithm-upgrade-plan.md → backend/services/hormesis_service.py
- `Algorithm Upgrade Plan` --cites--> `Bio Age Computation`  [EXTRACTED]
  context/algorithm-upgrade-plan.md → backend/services/bio_age_service.py
- `Algorithm Upgrade Plan` --cites--> `VO2max Estimation`  [EXTRACTED]
  context/algorithm-upgrade-plan.md → backend/services/vo2max_service.py
- `Algorithm Upgrade Plan` --cites--> `Nutrition Scoring`  [EXTRACTED]
  context/algorithm-upgrade-plan.md → backend/services/nutrition_service.py

## Import Cycles
- None detected.

## Communities (33 total, 6 thin omitted)

### Community 0 - "Bio-Age Computation"
Cohesion: 0.19
Nodes (21): date, _find_worst_dimension(), get_daily_leverage_point(), _compute_streak_from_protocols(), _create_default_protocol(), _find_protocol(), get_compliance_streak(), get_daily_protocol() (+13 more)

### Community 1 - "API Routes & FastAPI"
Cohesion: 0.19
Nodes (22): _composite_to_bio_age(), _compute_all_dimensions(), _compute_allostatic_load(), compute_bio_age(), _compute_hazard_ratios(), _compute_intervention_efficacy(), compute_leverage_point(), _compute_organ_ages() (+14 more)

### Community 2 - "Nutrition & Scoring"
Cohesion: 0.19
Nodes (22): _composite_to_bio_age(), _compute_all_dimensions(), _compute_allostatic_load(), compute_bio_age(), _compute_hazard_ratios(), _compute_intervention_efficacy(), compute_leverage_point(), _compute_organ_ages() (+14 more)

### Community 3 - "Prediction & Classification"
Cohesion: 0.16
Nodes (19): bio_age_current(), bio_age_history(), circadian_score(), healthy_score(), intervention_today(), _load_services(), mind_score(), predict() (+11 more)

### Community 4 - "Services Infrastructure"
Cohesion: 0.20
Nodes (19): Algorithm Upgrade Plan, Bio Age Computation, Circadian Nutrition Advanced, Circadian Nutrition Scoring, Q-Table Coordinator, Hormesis Tracker, Inflammaging Score, Intervention Engine (+11 more)

### Community 6 - "Protocol & Circadian"
Cohesion: 0.21
Nodes (9): format_food_name(), get_nutrition(), predict_food(), _classify_region(), predict_food(), Image, _classify_region(), predict_food() (+1 more)

### Community 7 - "Agent System"
Cohesion: 0.22
Nodes (3): compute_nutrient_timing(), compute_sleep_nutrition_correlation(), _parse_hour()

### Community 8 - "Data Models"
Cohesion: 0.22
Nodes (3): compute_nutrient_timing(), compute_sleep_nutrition_correlation(), _parse_hour()

### Community 9 - "Docker & Config"
Cohesion: 0.38
Nodes (9): _extract_meal_calories(), _extract_meal_times(), _filter_meals_for_day(), _get_melatonin_onset(), _score_caloric_distribution(), score_day(), _score_eating_window(), _score_fasting_consistency() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (9): _extract_meal_calories(), _extract_meal_times(), _filter_meals_for_day(), _get_melatonin_onset(), _score_caloric_distribution(), score_day(), _score_eating_window(), _score_fasting_consistency() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.39
Nodes (8): _calc_consistency(), _calc_distribution(), _calc_eating_window(), _calc_timing(), _meal_period(), _safe_int(), score_circadian_extended(), score_circadian_nutrition()

### Community 12 - "Community 12"
Cohesion: 0.39
Nodes (8): _calc_consistency(), _calc_distribution(), _calc_eating_window(), _calc_timing(), _meal_period(), _safe_int(), score_circadian_extended(), score_circadian_nutrition()

### Community 13 - "Community 13"
Cohesion: 0.43
Nodes (6): _calc_cardio_score(), _calc_mobility_score(), _calc_neat_score(), _calc_resistance_score(), _filter_workouts_by_range(), get_weekly_movement_score()

### Community 14 - "Community 14"
Cohesion: 0.43
Nodes (6): _calc_cardio_score(), _calc_mobility_score(), _calc_neat_score(), _calc_resistance_score(), _filter_workouts_by_range(), get_weekly_movement_score()

### Community 15 - "Community 15"
Cohesion: 0.52
Nodes (6): get_calorie_state(), get_consistency_state(), get_fat_state(), get_multi_agent_recommendation(), get_protein_state(), get_timing_state()

### Community 16 - "Community 16"
Cohesion: 0.52
Nodes (6): get_calorie_state(), get_consistency_state(), get_fat_state(), get_multi_agent_recommendation(), get_protein_state(), get_timing_state()

### Community 19 - "Community 19"
Cohesion: 0.60
Nodes (3): compute_hormesis(), _safe_float(), _safe_int()

### Community 20 - "Community 20"
Cohesion: 0.70
Nodes (4): calculate_mind_score(), calculate_mind_score_from_counts(), generate_mind_recommendation(), meals_to_mind_counts()

### Community 21 - "Community 21"
Cohesion: 0.60
Nodes (3): compute_hormesis(), _safe_float(), _safe_int()

### Community 22 - "Community 22"
Cohesion: 0.70
Nodes (4): calculate_mind_score(), calculate_mind_score_from_counts(), generate_mind_recommendation(), meals_to_mind_counts()

## Knowledge Gaps
- **2 isolated node(s):** `Circadian Nutrition Advanced`, `Q-Table Coordinator`
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `score_day()` connect `Docker & Config` to `Bio-Age Computation`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `score_day()` connect `Community 10` to `Bio-Age Computation`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `get_weekly_movement_score()` connect `Community 13` to `Bio-Age Computation`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Bio Age Computation` (e.g. with `Bio Age Computation` and `Protocol Check-in Service`) actually correct?**
  _`Bio Age Computation` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Generate nutrition_data.json for all 270 food classes.`, `Test endpoint that reads raw body without UploadFile.`, `Circadian Nutrition Advanced` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Hormesis & VO2Max` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._