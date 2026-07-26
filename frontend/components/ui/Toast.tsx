"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Portal } from "@/components/ui/Portal";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, duration = 4500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 100);
    const hide = setTimeout(() => setVisible(false), duration);
    const cleanup = setTimeout(() => onClose(), duration + 400);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(cleanup);
    };
  }, [duration, onClose]);

  return (
    <Portal>
    <div
      className={`fixed left-1/2 top-5 z-[100] -translate-x-1/2 transition-all duration-500 ease-out ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
    >
      <div className="flex items-center gap-3 rounded-[28px] border border-white/60 bg-green-900/15 py-3 px-4 shadow-[0_24px_70px_rgba(20,83,45,0.14)] backdrop-blur-xl">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-emerald-100">
          <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
        </div>

        <p className="whitespace-nowrap text-sm font-semibold text-zinc-700">{message}</p>
      </div>
    </div>
    </Portal>
  );
}
