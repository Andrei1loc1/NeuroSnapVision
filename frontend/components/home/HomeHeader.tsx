"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { getStoredProfile } from "@/lib/auth/profile";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bună dimineața";
  if (hour < 17) return "Bună ziua";
  return "Bună seara";
}

interface HomeHeaderProps {
  onAIClick?: () => void;
}

const HomeHeader = ({ onAIClick }: HomeHeaderProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const profile = getStoredProfile();
  const name = mounted ? (profile?.displayName ?? "Utilizator") : "";
  const greeting = mounted ? getGreeting() : "";

  return (
    <header className="flex items-center justify-between px-5 pt-10 pb-3">
      <div className="flex items-center gap-3">
        <Image src="/images/leaf.png" alt="NeuroSnap" width={32} height={32} className="rounded-full ring-1 ring-white/50" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900" suppressHydrationWarning>
            {greeting}{mounted ? ", " : ""}{name}
          </h1>
          <p className="text-[11px] text-zinc-400">
            Să-ți menținem stilul de viață pe drumul bun.
          </p>
        </div>
      </div>

      {onAIClick && (
        <button
          onClick={onAIClick}
          className="group relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-3.5 py-2 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">AI</span>
        </button>
      )}
    </header>
  );
};

export default HomeHeader;