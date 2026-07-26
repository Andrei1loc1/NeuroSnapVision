"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/client";

export interface DayCheckIns {
  morning: boolean;
  evening: boolean;
}

export interface StreakData {
  dates: Record<string, DayCheckIns>;
}

export interface UseStreakResult {
  currentStreak: number;
  longestStreak: number;
  graceDay: boolean;
  message: string;
  checkInDates: string[];
}

const STORAGE_KEY = "neurosnap_streak";

function getStreakData(): StreakData {
  if (typeof window === "undefined") return { dates: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dates: {} };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { dates: {} };
  }
}

function saveStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function fetchStreakFromDB(): Promise<StreakData | null> {
  try {
    const res = await apiFetch<{ data: { dates: Record<string, DayCheckIns> } }>(
      "/api/bio-age/protocol/streak"
    );
    return res.data;
  } catch {
    return null;
  }
}

function mergeStreakData(local: StreakData, remote: StreakData): StreakData {
  const merged: StreakData = { dates: { ...local.dates } };
  for (const [date, checkins] of Object.entries(remote.dates)) {
    if (!merged.dates[date]) {
      merged.dates[date] = { morning: false, evening: false };
    }
    if (checkins.morning) merged.dates[date].morning = true;
    if (checkins.evening) merged.dates[date].evening = true;
  }
  return merged;
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function markCheckIn(date: string, type: "morning" | "evening"): void {
  const data = getStreakData();
  if (!data.dates[date]) {
    data.dates[date] = { morning: false, evening: false };
  }
  data.dates[date][type] = true;
  saveStreakData(data);
}

export type DayCompletion = "none" | "morning" | "evening" | "both";

export function getDayCompletion(data: StreakData, date: string): DayCompletion {
  const day = data.dates[date];
  if (!day) return "none";
  if (day.morning && day.evening) return "both";
  if (day.morning) return "morning";
  if (day.evening) return "evening";
  return "none";
}

function computeStreak(data: StreakData): {
  currentStreak: number;
  longestStreak: number;
  graceDay: boolean;
} {
  const allDates = Object.keys(data.dates).filter(
    (d) => data.dates[d].morning || data.dates[d].evening
  );

  if (allDates.length === 0) return { currentStreak: 0, longestStreak: 0, graceDay: false };

  const sorted = [...allDates].sort();
  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 86400000));

  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sorted) {
    const d = new Date(dateStr + "T12:00:00");
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diff = Math.round((d.getTime() - prevDate.getTime()) / 86400000);
      if (diff === 1) {
        tempStreak++;
      } else if (diff === 2) {
        tempStreak = 1;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = d;
  }

  let currentStreak = 0;
  let graceDay = false;

  const hasToday = data.dates[today]?.morning || data.dates[today]?.evening;
  const hasYesterday = data.dates[yesterday]?.morning || data.dates[yesterday]?.evening;

  if (hasToday) {
    currentStreak = 1;
    let checkDate = new Date(yesterday + "T12:00:00");
    while (true) {
      const dateStr = toISODate(checkDate);
      if (data.dates[dateStr]?.morning || data.dates[dateStr]?.evening) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  } else if (hasYesterday) {
    currentStreak = 1;
    let checkDate = new Date(toISODate(new Date(Date.now() - 2 * 86400000)) + "T12:00:00");
    while (true) {
      const dateStr = toISODate(checkDate);
      if (data.dates[dateStr]?.morning || data.dates[dateStr]?.evening) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  } else {
    const dayBeforeYesterday = toISODate(new Date(Date.now() - 2 * 86400000));
    if (data.dates[dayBeforeYesterday]?.morning || data.dates[dayBeforeYesterday]?.evening) {
      graceDay = true;
      currentStreak = 1;
      let checkDate = new Date(toISODate(new Date(new Date(dayBeforeYesterday + "T12:00:00").getTime() - 86400000)) + "T12:00:00");
      while (true) {
        const dateStr = toISODate(checkDate);
        if (data.dates[dateStr]?.morning || data.dates[dateStr]?.evening) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
      graceDay = false;
    }
  }

  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return { currentStreak, longestStreak, graceDay };
}

function getMessage(streak: number, graceDay: boolean): string {
  if (graceDay) return "1 zi de grație — revino azi!";
  if (streak === 0) return "Începe azi! Un singur check-in contează.";
  if (streak >= 1 && streak <= 2) return "Bun început! Continuă mâine.";
  if (streak >= 3 && streak <= 6) return "Aproape o săptămână completă!";
  if (streak >= 7 && streak < 30) return "O săptămână completă! Ești în formă.";
  return "30 de zile consecutive! Impresionant.";
}

export function useStreak(): UseStreakResult {
  const [data, setData] = useState<StreakData>({ dates: {} });

  useEffect(() => {
    const local = getStreakData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(local);

    fetchStreakFromDB().then((remote) => {
      if (remote) {
        const merged = mergeStreakData(local, remote);
        saveStreakData(merged);
        setData(merged);
      }
    });
  }, []);

  const { currentStreak, longestStreak, graceDay } = computeStreak(data);
  const message = getMessage(currentStreak, graceDay);
  const checkInDates = Object.keys(data.dates).filter(
    (d) => data.dates[d].morning || data.dates[d].evening
  );

  return {
    currentStreak,
    longestStreak,
    graceDay,
    message,
    checkInDates,
  };
}

export { getStreakData };