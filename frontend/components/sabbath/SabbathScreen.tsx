"use client";

import { useRouter } from "next/navigation";
import { Portal } from "@/components/ui/Portal";

export default function SabbathScreen() {
  const router = useRouter();
  const today = new Date();
  const dateStr = today.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <p className="max-w-xs text-center text-xl font-light leading-relaxed text-[#e8e4df]">
          Astăzi nu ești o colecție de date.
        </p>
        <p className="mt-6 max-w-xs text-center text-base font-light leading-relaxed text-[#b0aca6]">
          Astăzi doar exiști. Ești suficient.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 pb-12">
        <p className="text-[11px] font-normal tracking-wide text-[#4a4743]">
          {dateStr}
        </p>
        <button
          onClick={() => router.push("/settings")}
          className="text-[11px] font-normal tracking-wide text-[#5a5753] underline decoration-[#5a5753]/40 underline-offset-4 transition-colors hover:text-[#8a8783] hover:decoration-[#8a8783]/60"
        >
          Configurează zi de repaus
        </button>
      </div>
    </div>
    </Portal>
  );
}