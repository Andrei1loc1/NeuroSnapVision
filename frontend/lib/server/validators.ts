/**
 * Server-side validators shared across API routes.
 * Normalizes enum-like user inputs safely.
 */

const mealTypes = ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"] as const;
export type MealTypeValue = (typeof mealTypes)[number];
const MEAL_TYPES = new Set<string>(mealTypes);

export function normalizeMealType(value: unknown): MealTypeValue {
  const mealType = String(value ?? "OTHER").toUpperCase();
  return MEAL_TYPES.has(mealType) ? (mealType as MealTypeValue) : "OTHER";
}

const portionSizes = ["SMALL", "MEDIUM", "LARGE", "FULL", "CUSTOM"] as const;
export type PortionSizeValue = (typeof portionSizes)[number];
const PORTION_SIZES = new Set<string>(portionSizes);

export function normalizePortionSize(value: unknown): PortionSizeValue {
  const portionSize = String(value ?? "CUSTOM").toUpperCase();
  return PORTION_SIZES.has(portionSize)
    ? (portionSize as PortionSizeValue)
    : "CUSTOM";
}

const reportTypes = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;
export type ReportTypeValue = (typeof reportTypes)[number];
const REPORT_TYPES = new Set<string>(reportTypes);

export function normalizeReportType(value: unknown): ReportTypeValue {
  const type = String(value ?? "CUSTOM").toUpperCase();
  return REPORT_TYPES.has(type) ? (type as ReportTypeValue) : "CUSTOM";
}
