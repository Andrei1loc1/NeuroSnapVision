"use client";

import { useEffect, useState } from "react";
import { Flame, Beef, Droplet, Scale } from "lucide-react";
import { getStoredTargets, type Targets } from "@/lib/auth/targets";
import { getStoredProfile, type ProfileData } from "@/lib/auth/profile";

interface MetricRow {
  label: string;
  value: string;
  icon: typeof Flame;
  iconColor: string;
  iconBg: string;
}

function formatValue(value: number | undefined, suffix: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

export default function ObiectivesCard() {
  const [targets, setTargets] = useState<Targets | null>(() => getStoredTargets());
  const [profile, setProfile] = useState<ProfileData | null>(() => getStoredProfile());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      if (e.key.includes("neurosnap_targets")) setTargets(getStoredTargets());
      if (e.key.includes("neurosnap_profile")) setProfile(getStoredProfile());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rows: MetricRow[] = [
    {
      label: "Calorii zilnice",
      value: targets ? formatValue(targets.target_calories, " kcal") : "—",
      icon: Flame,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Proteine",
      value: targets ? formatValue(targets.target_protein, "g") : "—",
      icon: Beef,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Grăsimi",
      value: targets ? formatValue(targets.target_fats, "g") : "—",
      icon: Droplet,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Greutate curentă",
      value: profile?.weight != null ? formatValue(profile.weight, " kg") : "—",
      icon: Scale,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
  ];

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <p className="mb-3 text-[13px] font-semibold text-zinc-700">Obiectivele mele</p>
      <div className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl bg-white/30 px-3 py-2.5 ring-1 ring-white/60"
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${row.iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${row.iconColor}`} />
                </div>
                <span className="text-[12px] font-medium text-zinc-600">{row.label}</span>
              </div>
              <span className="text-[13px] font-bold text-zinc-900">{row.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}