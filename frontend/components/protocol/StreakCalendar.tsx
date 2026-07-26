"use client";

import { useMemo } from "react";
import { getDayCompletion, type DayCompletion, type StreakData } from "@/hooks/useStreak";

const DAY_LABELS = [
  { key: "L", label: "L" },
  { key: "Ma", label: "M" },
  { key: "Mi", label: "M" },
  { key: "J", label: "J" },
  { key: "V", label: "V" },
  { key: "S", label: "S" },
  { key: "D", label: "D" },
];

const COMPLETION_STYLES: Record<DayCompletion, string> = {
  none: "bg-white/30",
  morning: "bg-emerald-200",
  evening: "bg-emerald-300",
  both: "bg-emerald-500",
};

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function StreakCalendar({ streakData }: { streakData: StreakData }) {
  const { grid } = useMemo(() => {
    const data = streakData;
    const todayDate = new Date();
    const todayStr = toISODate(todayDate);

    const days: { date: string; completion: DayCompletion; isToday: boolean }[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);
      days.push({
        date: dateStr,
        completion: getDayCompletion(data, dateStr),
        isToday: dateStr === todayStr,
      });
    }

    const startDow = new Date(todayDate);
    startDow.setDate(startDow.getDate() - 34);
    const startDayIndex = (startDow.getDay() + 6) % 7;

    const grid: {
      date: string;
      completion: DayCompletion;
      isToday: boolean;
      isEmpty?: boolean;
    }[][] = [];

    const firstWeekDays = 7 - startDayIndex;
    const firstWeek: typeof grid[0] = [];
    for (let i = 0; i < startDayIndex; i++) {
      firstWeek.push({ date: "", completion: "none", isToday: false, isEmpty: true });
    }
    for (let i = 0; i < firstWeekDays; i++) {
      firstWeek.push(days[i]);
    }
    grid.push(firstWeek);

    let dayIndex = firstWeekDays;
    for (let w = 1; w < 5; w++) {
      const week: typeof grid[0] = [];
      for (let d = 0; d < 7; d++) {
        if (dayIndex < days.length) {
          week.push(days[dayIndex]);
          dayIndex++;
        } else {
          week.push({ date: "", completion: "none", isToday: false, isEmpty: true });
        }
      }
      grid.push(week);
    }

    return { grid };
  }, [streakData]);

  return (
    <section className="mx-6 mt-4 rounded-[32px] border border-white bg-white/20 p-5 shadow-[0_24px_70px_rgba(20,83,45,0.10)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-600">Calendar Zile Consecutive</p>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald-200" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald-300" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500" />
        </div>
      </div>

      <div className="flex gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d.key}
            className="flex-1 text-center text-[10px] font-medium text-zinc-400"
          >
            {d.label}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {grid.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className={`flex-1 flex items-center justify-center aspect-square rounded-[6px] transition-all ${
                  day.isEmpty
                    ? "bg-transparent"
                    : COMPLETION_STYLES[day.completion]
                } ${
                  day.isToday && !day.isEmpty
                    ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-transparent"
                    : ""
                }`}
                title={day.isEmpty ? "" : day.date}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400">
        <span>Acum 5 săpt.</span>
        <span>Azi</span>
      </div>
    </section>
  );
}