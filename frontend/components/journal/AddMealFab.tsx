"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddMealFab() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/vision-ai")}
      aria-label="Adaugă masă"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <Camera className="h-6 w-6" />
    </button>
  );
}