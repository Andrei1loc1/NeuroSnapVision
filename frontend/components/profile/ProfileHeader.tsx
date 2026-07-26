"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getStoredProfile, type ProfileData } from "@/lib/auth/profile";
import { getGoalLabel } from "@/lib/constants/goals";

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "U";
}

export default function ProfileHeader() {
  const router = useRouter();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(() => getStoredProfile());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key && e.key.includes("neurosnap_profile")) {
        setProfile(getStoredProfile());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const displayName = profile?.displayName ?? user?.displayName ?? "Vizitator";
  const goalLabel = profile?.goal ? getGoalLabel(profile.goal) : "Obiectiv nesetat";

  return (
    <>
      <div className="px-5 pt-10 pb-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Înapoi"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm transition-colors hover:bg-white/60"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Profil</h1>
      </div>

      <section className="glass-card card-animate mx-5 mt-1 p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-emerald-100 flex items-center justify-center shadow-sm">
            {profile?.displayName ? (
              <span className="text-xl font-bold text-emerald-700">{getInitials(displayName)}</span>
            ) : (
              <Image
                src="/images/leaf.png"
                alt="Avatar"
                fill
                className="object-contain p-2"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold tracking-tight text-zinc-900">{displayName}</p>
            <p className="mt-0.5 truncate text-[12px] font-medium capitalize text-zinc-500">{goalLabel}</p>
          </div>
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/50 text-zinc-600 ring-1 ring-white/80 transition-colors hover:bg-white active:scale-95"
            aria-label="Editează profilul"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </section>
    </>
  );
}