"use client";

import { useRouter } from "next/navigation";
import { User, Target, Bell, LogOut, ChevronRight } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

const navItems = [
  { label: "Date personale", icon: User, href: "/profile/edit" },
  { label: "Obiective nutriție", icon: Target, href: "/profile/goals" },
];

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-500" />
      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  );
}

export default function ProfileMenu() {
  const { logout } = useUser();
  const router = useRouter();
  const { enabled, toggle } = useNotificationSettings();

  async function handleLogout() {
    await logout();
    router.push("/onboarding");
  }

  return (
    <section className="glass-card card-animate mx-5 mt-2 mb-4 p-2">
      <div className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-zinc-700 transition-colors hover:bg-white/50 active:scale-[0.99]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left text-[13px] font-semibold text-zinc-700">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-zinc-300" />
            </button>
          );
        })}

        <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Bell className="h-4 w-4" />
          </div>
          <span className="flex-1 text-[13px] font-semibold text-zinc-700">Notificări</span>
          <ToggleSwitch enabled={enabled} onChange={toggle} />
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-zinc-500 transition-colors hover:bg-zinc-100/50 active:scale-[0.99]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="flex-1 text-left text-[13px] font-semibold text-zinc-500">Deconectare</span>
        </button>
      </div>
    </section>
  );
}