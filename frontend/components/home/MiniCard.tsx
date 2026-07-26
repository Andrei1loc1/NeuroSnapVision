"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MiniCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  href: string;
  color: string;
}

function MiniCard({ icon, label, value, subtitle, href, color }: MiniCardProps) {
  const isPrompt = !/^-?\d/.test(value);

  return (
    <Link href={href} className="glass-card card-animate flex flex-col gap-1.5 rounded-2xl p-3.5 active:scale-[0.98] transition-transform">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        {isPrompt ? (
          <span className="flex items-center gap-1 text-[12px] italic leading-snug text-zinc-400">
            {value}
            <ArrowRight className="h-3 w-3 shrink-0 text-zinc-400" />
          </span>
        ) : (
          <>
            <span className="text-[22px] font-bold leading-none text-zinc-800">
              {value}
            </span>
            {subtitle && (
              <span className="text-[10px] font-medium text-zinc-400">
                {subtitle}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

export default MiniCard;