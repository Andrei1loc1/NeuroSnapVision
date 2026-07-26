import { apiFetch } from "./client";

export interface SolarWindow {
  solarNoon: string;
  currentSolarAngle: number;
  melatoninOnset: string;
  optimalEatingWindow: { start: string; end: string };
  currentMetabolicEfficiency: number;
  phase: "alert" | "transition" | "wind-down" | "sleep";
}

export function fetchSolarWindow() {
  return apiFetch<{ data: SolarWindow }>("/api/circadian/solar-window").then((res) => res.data);
}

export interface HrvReadingInput {
  sdnn?: number;
  rmssd?: number;
  stressLevel: number;
  sessionDurationSec?: number;
  source?: string;
}

export interface HrvReadingResponse {
  id: string;
  stressLevel: number;
  recommendation?: string;
}

export function createHrvReading(data: HrvReadingInput) {
  return apiFetch<HrvReadingResponse>("/api/hrv/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export interface HrvStatus {
  latestStressLevel: number;
  hrvBaseline: number;
  trend: "improving" | "stable" | "deteriorating";
  needsPause: boolean;
}

export function fetchHrvStatus() {
  return apiFetch<HrvStatus>("/api/hrv/status");
}

export interface AllostaticSnapshot {
  dailyLoad: number;
  cumulativeLoad: number;
  trend: string;
  hrvBaseline: number;
  stressEvents: number;
  recoveryScore: number;
}

export function fetchAllostaticSnapshot() {
  return apiFetch<AllostaticSnapshot>("/api/allostatic/snapshot");
}

export interface AllostaticTrajectoryPoint {
  date: string;
  dailyLoad: number;
  cumulativeLoad: number;
}

export function fetchAllostaticTrajectory(days?: number) {
  const params = days ? `?days=${days}` : "";
  return apiFetch<AllostaticTrajectoryPoint[]>(
    `/api/allostatic/trajectory${params}`
  );
}

export interface NorthStar {
  northStar: string;
  whyStatement: string | null;
  values: string[];
}

export function fetchNorthStar() {
  return apiFetch<NorthStar>("/api/purpose/north-star");
}

export function updateNorthStar(data: Partial<NorthStar>) {
  return apiFetch<NorthStar>("/api/purpose/north-star", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export interface MeaningAlignment {
  date: string;
  alignmentScore: number;
  reflection: string | null;
  gratitudeNote: string | null;
}

export function fetchMeaningAlignment() {
  return apiFetch<MeaningAlignment>("/api/purpose/alignment");
}

export interface SabbathConfig {
  sabbathDay: number;
  isActive: boolean;
}

export function fetchSabbathConfig() {
  return apiFetch<SabbathConfig>("/api/sabbath/config");
}

export function updateSabbathConfig(data: Partial<SabbathConfig>) {
  return apiFetch<SabbathConfig>("/api/sabbath/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export interface SabbathStatus {
  isSabbath: boolean;
  message: string;
}

export function fetchSabbathStatus() {
  return apiFetch<SabbathStatus>("/api/sabbath/status");
}

export interface EncryptedJournalInput {
  date: string;
  encryptedEntry: string;
  iv: string;
}

export interface EncryptedJournalResponse {
  id: string;
  date: string;
  encryptedEntry: string;
  iv: string;
}

export function createEncryptedJournal(data: EncryptedJournalInput) {
  return apiFetch<EncryptedJournalResponse>("/api/journal/encrypted", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function fetchEncryptedJournals(dateRange?: {
  start: string;
  end: string;
}) {
  const params = dateRange
    ? `?start=${dateRange.start}&end=${dateRange.end}`
    : "";
  return apiFetch<EncryptedJournalResponse[]>(
    `/api/journal/encrypted${params}`
  );
}

export interface SessionMetricInput {
  sessionDurationSec: number;
}

export interface SessionMetricResponse {
  id: string;
  kpiScore: number;
}

export function createSessionMetric(data: SessionMetricInput) {
  return apiFetch<SessionMetricResponse>("/api/session/metric", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}