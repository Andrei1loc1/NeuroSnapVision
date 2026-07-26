/**
 * Centralized TypeScript domain types.
 * Single source of truth for data structures shared across
 * frontend modules, hooks, components, and API clients.
 */

// ─── Nutrition ─────────────────────────────────────────────────
export interface NutritionTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface MacroItem {
  label: string;
  value: string;
  percent: number;
}

// ─── Meals ─────────────────────────────────────────────────────
export interface MealItemData {
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  portionSize?: string | null;
}

export interface MealData {
  id: string;
  mealType: string;
  title: string;
  loggedAt: string;
  notes: string | null;
  items: MealItemData[];
  sourceScan?: { image?: { url: string } | null } | null;
  metabolicMultiplier?: number | null;
  stressMultiplier?: number | null;
}

export interface DailyTotals extends NutritionTotals {
  mealCount: number;
}

export interface RecentMealResult {
  title: string;
  mealType: string;
  loggedAt: string;
  calories: number;
  imageUrl: string | null;
}

// ─── Journal (UI-facing) ───────────────────────────────────────
export interface JournalMeal {
  id: string;
  time: string;
  label: string;
  title: string;
  calories: number;
  image?: string | null;
  macros: string;
  portionSize: string | null;
  metabolicMultiplier?: number | null;
}

// ─── Reports ──────────────────────────────────────────────────
export interface ReportTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface ReportData {
  title: string;
  range: { start: string; end: string };
  mealCount: number;
  totals: ReportTotals;
  macroBalance: { protein: number; carbs: number; fat: number };
  recommendations: { title: string; description: string }[];
  foodDiversity?: FoodDiversityScore;
  upf?: UPFScore;
  peRatio?: PERatioScore;
  fiber?: FiberScore;
  nutrientTiming?: NutrientTimingScore;
  compliance?: ComplianceScore;
  sleepNutrition?: SleepNutritionCorrelation;
  weekOverWeek?: WeekOverWeekTrends;
  smartRecommendations?: SmartRecommendation[];
}

export interface DailyCalories {
  day: string;
  calories: number;
}

export interface FoodDiversityScore {
  food_diversity_score: number;
  unique_foods: number;
  target: number;
  foods_list: string[];
}

export interface UPFScore {
  upf_score: number;
  upf_count: number;
  total_meals: number;
  upf_percentage: number;
}

export interface PERatioScore {
  pe_ratio_score: number;
  average_pe_ratio: number;
  target: number;
}

export interface FiberScore {
  fiber_score: number;
  fiber_meals: number;
  target: number;
}

export interface NutrientTimingScore {
  nutrient_timing_score: number;
  first_meal_hour: number | null;
  last_meal_hour: number | null;
  eating_window_hours: number | null;
  breakdown: {
    first_meal: number;
    last_meal: number;
    window: number;
  };
}

export interface ComplianceScore {
  compliance_score: number;
  followed: number;
  total: number;
  streak: number;
}

export interface SleepNutritionCorrelation {
  correlation_detected: boolean;
  late_eating_days: number;
  normal_days: number;
  avg_sleep_late: number;
  avg_sleep_normal: number;
  message: string;
}

export interface WeekOverWeekTrend {
  delta: number;
  direction: "up" | "down" | "stable";
}

export interface WeekOverWeekTrends {
  trends: Record<string, WeekOverWeekTrend>;
  improving_metrics: string[];
  declining_metrics: string[];
}

export interface SmartRecommendation {
  title: string;
  description: string;
  metric: string;
  current: number;
  target: number;
  impact: string;
}

// ─── Backend (Python) ─────────────────────────────────────────
export interface HealthyScoreInput {
  calories: number;
  protein: number;
  fats: number;
  target_calories: number;
  target_protein: number;
  target_fats: number;
  late_meals_count: number;
  days_on_target: number;
}

export interface HealthyScoreResult {
  healthy_score: number;
  sub_scores: {
    calories: number;
    protein: number;
    fats: number;
    meal_timing: number;
    consistency: number;
  };
}

export interface RecommendationResult {
  selected_agent: string;
  state: string;
  action: string;
  recommendation: string;
  all_agents: Record<string, unknown>;
}

export interface MindScoreInput {
  meals: { food_class: string }[];
}

export interface MindScoreResult {
  brain_nutrition_score: number;
  positive_score: number;
  negative_score: number;
  pattern: string;
  category_counts: Record<string, number>;
  recommendation: string;
}

// ─── Prediction (AI Scan) ────────────────────────────────────
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PredictionResult {
  food_class?: string;
  display_name?: string;
  confidence?: number;
  portion?: string;
  bbox?: BoundingBox | null;
  yolo_confidence?: number | null;
  crop_image?: string | null;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  top_predictions?: PredictionResult[];
  all_regions?: PredictionResult[] | null;
}

export interface SavedScan {
  id: string;
  status: string;
}

export interface UploadedScanImage {
  url: string;
  mimeType?: string;
  sizeBytes?: number;
}

// ─── Daily Protocol ──────────────────────────────────────────
export interface DailyProtocol {
  id: string;
  userId: string;
  date: string;
  morningRecovery: number | null;
  morningEnergy: number | null;
  morningMood: number | null;
  morningFocus: number | null;
  eveningStress: number | null;
  eveningDigestion: number | null;
  eveningMood: number | null;
  eveningEnergy: number | null;
  eveningLibido: number | null;
  supplements: string[];
  completedAt: string | null;
  isComplete: boolean;
  morningLight?: boolean;
  socialConnection?: number;
  coldExposure?: boolean;
  heatExposure?: boolean;
  oralHealth?: boolean;
  caffeineCutoff?: boolean;
  screenCutoff?: boolean;
}

// ─── Bio-Age ────────────────────────────────────────────────
export interface BioAgeSnapshot {
  id: string;
  userId: string;
  date: string;
  biologicalAge: number;
  chronologicalAge: number;
  paceOfAging: number;
  paceLabel: "decelerating" | "normal" | "accelerating";
  nutritionScore: number;
  sleepScore: number;
  ansScore: number;
  movementScore: number;
  lightScore: number;
  subjectiveScore: number;
  brainAge: number | null;
  cardiovascularAge: number | null;
  metabolicAge: number | null;
  immuneAge: number | null;
  topLeverageDimension: string | null;
  leverageAction: string | null;
  projectedImpact: number | null;
  inputData: Record<string, unknown>;
  createdAt: string;
  hazardRatios: HazardRatios;
  vo2max: VO2MaxEstimate;
  inflammaging: InflammagingScore;
  hormesis: HormesisScore;
  proteinTiming: ProteinTimingScore;
  circadianExtended: CircadianExtendedScore;
  interventionEfficacy: InterventionEfficacy;
}

export interface LeveragePoint {
  dimension: string;
  action: string;
  projectedImpact: number;
  currentScore: number;
  targetScore: number;
}

// ─── Workout Log ────────────────────────────────────────────
export interface WorkoutLog {
  id: string;
  userId: string;
  date: string;
  type: "strength" | "cardio" | "mobility" | "sport" | "walk" | "other";
  intensity: number;
  durationMin: number;
  notes: string | null;
  source: "manual" | "voice";
  createdAt: string;
}

export interface MovementQuality {
  movementScore: number;
  breakdown: {
    resistance: number;
    cardio: number;
    mobility: number;
    neat: number;
  };
}

// ─── Circadian Nutrition ────────────────────────────────────
export interface CircadianNutritionScore {
  circadianScore: number;
  eatingWindow: { start: string; end: string; hours: number };
  distribution: { beforeMelatonin: number; afterMelatonin: number };
  timing: { proteinEvenness: number };
  consistency: { stdDevHours: number };
}

// ─── Wisdom Cards ──────────────────────────────────────────────
export type WisdomDimension = "nutrition" | "sleep" | "ans" | "movement" | "light" | "subjective";

export interface WisdomCard {
  id: string;
  dimension: WisdomDimension;
  scoreRange: [number, number];
  title: string;
  insight: string;
  action: string;
  source: string;
}

// ─── Hazard Ratios ──────────────────────────────────────────
export interface HazardRatios {
  movement: number;
  nutrition: number;
  sleep: number;
  ans: number;
  light: number;
  subjective: number;
  hormesis: number;
}

// ─── VO2 Max ────────────────────────────────────────────────
export interface VO2MaxEstimate {
  vo2max_estimated: number;
  vo2max_score: number;
  zone2_volume: number;
  hiit_frequency: number;
  percentile: "elite" | "above_average" | "average" | "below_average" | "low";
}

// ─── Inflammaging ───────────────────────────────────────────
export interface InflammagingScore {
  inflammaging_score: number;
  breakdown: {
    sleep_quality: number;
    processed_food: number;
    overtraining: number;
    stress: number;
    omega3: number;
  };
  processed_food_count: number;
  hiit_count: number;
  fish_count: number;
  oral_health_penalty: number;
}

// ─── Hormesis ───────────────────────────────────────────────
export interface HormesisScore {
  hormesis_score: number;
  breakdown: {
    cold_exposure: number;
    heat_exposure: number;
    fasting_autophagy: number;
    exercise_intensity: number;
  };
  active_stressors: string[];
}

// ─── Protein Timing ─────────────────────────────────────────
export interface ProteinTimingScore {
  protein_timing_score: number;
  meals_with_protein: number;
  total_meals: number;
}

// ─── Circadian Extended ─────────────────────────────────────
export interface CircadianExtendedScore {
  circadian_extended_score: number;
  breakdown: {
    morning_light: number;
    caffeine_cutoff: number;
    screen_cutoff: number;
  };
}

// ─── Intervention Efficacy ──────────────────────────────────
export interface InterventionEfficacy {
  hasHistory: boolean;
  dimension?: string;
  scoreBefore?: number;
  scoreNow?: number;
  delta?: number;
  message: string;
}

// ─── AI Chat ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  sources?: string[];
}

export interface ChatContext {
  userId: string;
  displayName: string;
  chronologicalAge: number;
  biologicalAge: number;
  paceOfAging: number;
  paceLabel: string;
  movementScore: number;
  nutritionScore: number;
  sleepScore: number;
  ansScore: number;
  lightScore: number;
  subjectiveScore: number;
  hormesisScore: number;
  vo2max: number;
  vo2maxPercentile: string;
  inflammagingScore: number;
  complianceScore: number;
  streak: number;
  leverageDimension: string;
  leverageAction: string;
  projectedImpact: number;
  upfCount: number;
  uniqueFoods: number;
  workoutCount: number;
  avgStress: number;
  sleepHours: number;
  proteinTimingScore: number;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  context: ChatContext;
}

export interface ChatStreamChunk {
  type: "text" | "tool_call" | "tool_result" | "done" | "error";
  content?: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  error?: string;
}

// ─── User ────────────────────────────────────────────────────
export interface StoredUser {
  id: string;
  displayName: string;
}

// ============================================================
// INOVAȚIA 1: Fereastra Metabolică Cronobiologică (CMW)
// ============================================================

export interface UserLocation {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timezone: string;
  cityName: string | null;
  updatedAt: string;
}

export interface CircadianProfile {
  id: string;
  userId: string;
  wakeTimeTarget: string;
  sleepTimeTarget: string;
  melatoninOnset: string | null;
  solarNoonOffset: number | null;
  circadianPhase: number | null;
  updatedAt: string;
}

export interface SolarWindow {
  solarNoon: string;
  currentSolarAngle: number;
  melatoninOnset: string;
  optimalEatingWindow: {
    start: string;
    end: string;
  };
  currentMetabolicEfficiency: number;
  phase: "alert" | "transition" | "wind-down" | "sleep";
}

// ============================================================
// INOVAȚIA 2: Traiectoria Încărcăturii Alostatice (ALT)
// ============================================================

export interface HrvReading {
  id: string;
  userId: string;
  timestamp: string;
  sdnn: number | null;
  rmssd: number | null;
  stressLevel: number;
  source: string;
  sessionDurationSec: number | null;
  createdAt: string;
}

export interface HrvReadingCreate {
  sdnn?: number;
  rmssd?: number;
  stressLevel: number;
  source?: string;
  sessionDurationSec?: number;
}

export interface StressEvent {
  id: string;
  userId: string;
  timestamp: string;
  stressLevel: number;
  trigger: string | null;
  resolution: string | null;
  durationSec: number | null;
  createdAt: string;
}

export interface StressEventCreate {
  stressLevel: number;
  trigger?: string;
  resolution?: string;
  durationSec?: number;
}

export interface AllostaticSnapshot {
  id: string;
  userId: string;
  date: string;
  dailyLoad: number;
  cumulativeLoad: number;
  trend: string | null;
  hrvBaseline: number | null;
  stressEvents: number;
  recoveryScore: number;
  createdAt: string;
}

export interface HrvStatus {
  latestStressLevel: number;
  hrvBaseline: number | null;
  trend: "improving" | "stable" | "deteriorating";
  needsPause: boolean;
}

// ============================================================
// INOVAȚIA 3: Protocolul Comportamental Ancorat în Sens (MABP)
// ============================================================

export interface UserPurpose {
  id: string;
  userId: string;
  northStar: string;
  whyStatement: string | null;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPurposeCreate {
  northStar: string;
  whyStatement?: string;
  values?: string[];
}

export interface MeaningAlignment {
  id: string;
  userId: string;
  date: string;
  alignmentScore: number;
  reflection: string | null;
  gratitudeNote: string | null;
  createdAt: string;
}

// ============================================================
// NIVELUL SPIRITUAL: Sabatul Digital
// ============================================================

export interface DigitalSabbath {
  id: string;
  userId: string;
  sabbathDay: number; // 0=Sunday, 6=Saturday
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SabbathStatus {
  isSabbath: boolean;
  message: string;
}

// ============================================================
// NIVELUL MORAL: Criptare + KPI
// ============================================================

export interface EncryptedJournal {
  id: string;
  userId: string;
  date: string;
  encryptedEntry: string;
  iv: string;
  createdAt: string;
}

export interface EncryptedJournalCreate {
  date: string;
  encryptedEntry: string;
  iv: string;
}

export interface SessionMetric {
  id: string;
  userId: string;
  date: string;
  sessionCount: number;
  totalDurationSec: number;
  avgDurationSec: number;
  kpiScore: number;
  createdAt: string;
}

export interface SessionMetricCreate {
  sessionDurationSec: number;
}

// ============================================================
// EXTENSII LA MODELE EXISTENTE
// ============================================================

export interface MealWithMultipliers {
  id: string;
  metabolicMultiplier: number | null;
  stressMultiplier: number | null;
  mealType: string;
  title: string;
  loggedAt: string;
  notes: string | null;
  items: MealItemData[];
  sourceScan?: { image?: { url: string } | null } | null;
}
