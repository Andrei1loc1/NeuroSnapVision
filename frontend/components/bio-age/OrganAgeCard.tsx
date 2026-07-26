"use client";

import React from "react";

interface OrganAgeCardProps {
  organName: string;
  age: number | null;
  chronologicalAge: number;
  icon: React.ReactNode;
}

function OrganAgeCard({
  organName,
  age,
  chronologicalAge,
  icon,
}: OrganAgeCardProps) {
  const delta = age !== null ? age - chronologicalAge : null;

  return (
    <div className="overflow-hidden rounded-[22px] border border-white/70 bg-white/20 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-emerald-400" />

          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-700">{organName}</p>
            <div className="flex items-end gap-1.5">
              <span className="text-[22px] font-semibold leading-none text-zinc-900">
                {age !== null ? age.toFixed(1) : "—"}
              </span>
              {delta !== null && (
                <span
                  className={`mb-0.5 text-[10px] font-semibold ${
                    delta <= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {delta <= 0 ? "" : "+"}
                  {delta.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default React.memo(OrganAgeCard);