"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigation, menuItems } from "@/hooks/useNavigation";
import { useUser } from "@/hooks/useUser";
import { useDataCache } from "@/lib/cache";
import { getStoredProfile } from "@/lib/auth/profile";
import {
  prefetchHomePage,
  prefetchBioAgePage,
  prefetchJournalPage,
  prefetchProtocolPage,
  prefetchReportsPage,
} from "@/lib/cache/prefetch";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

function NavItem({
  tab,
  isActive,
  onClick,
  onMouseEnter,
}: {
  tab: { name: string; path: string; icon: LucideIcon; label: string };
  isActive: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  const Icon = tab.icon;
  const activeColor = "var(--color-primary-600)";
  const inactiveColor = "var(--color-gray-400)";
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-105"
      aria-label={tab.label}
    >
      <span style={{ color: isActive ? activeColor : inactiveColor }}>
        <Icon size={20} />
      </span>
      <span style={{ color: isActive ? activeColor : inactiveColor, fontSize: "11px", fontWeight: 600 }}>
        {tab.label}
      </span>
    </button>
  );
}

function FloatingScanButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute left-1/2 -top-8 -translate-x-1/2">
      <button
        onClick={onClick}
        aria-label="Scan"
        className="relative h-[80px] w-[80px] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <Image
          src="/images/icon_camera.png"
          alt="Scan"
          fill
          sizes="80px"
          className="object-contain"
          priority
        />
      </button>
    </div>
  );
}

function MoreMenu({
  isOpen,
  onClose,
  onNavigate,
  onItemHover,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onItemHover?: (path: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className="absolute bottom-full right-0 z-50 mb-2 w-52 rounded-[22px] border border-white bg-white/70 p-2 shadow-[0_16px_40px_rgba(20,83,45,0.12)] backdrop-blur-2xl"
        style={{
          animation: "menuSlideUp 0.15s ease-out",
        }}
      >
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onMouseEnter={() => onItemHover?.(item.path)}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all hover:bg-white/50 active:scale-[0.98]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function useUserAge(): number {
  try {
    const profile = getStoredProfile();
    if (profile?.age) return Number(profile.age);
  } catch (err) {
    console.warn("[Navbar] failed to read user age", err);
  }
  return 30;
}

export default function Navbar() {
  const { tabs, navigateTo, navigateToPath, isActive, isMenuPathActive } = useNavigation();
  const [moreOpen, setMoreOpen] = useState(false);
  const cache = useDataCache();
  const age = useUserAge();

  const { user } = useUser();
  const userId = user?.id ?? "";

  const leftTabs = tabs.slice(0, 2);
  const moreTab = tabs[4];
  const MoreIcon = moreTab.icon;

  const handleHover = (path: string) => {
    switch (path) {
      case "/":
        prefetchHomePage(cache, userId, age);
        break;
      case "/journal":
        prefetchJournalPage(cache);
        break;
      case "/protocol":
        prefetchProtocolPage(cache, userId);
        break;
      case "/bio-age":
        prefetchBioAgePage(cache, userId, age);
        break;
      case "/reports":
        prefetchReportsPage(cache);
        break;
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4">
      <MoreMenu
        isOpen={moreOpen}
        onClose={() => setMoreOpen(false)}
        onNavigate={navigateToPath}
        onItemHover={handleHover}
      />

      <div
        className="relative flex w-full items-center justify-between border border-white bg-white/60 px-5 py-3 backdrop-blur-xl"
        style={{ borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-md)" }}
      >
        <div className="flex items-center gap-6">
          {leftTabs.map((tab) => (
            <NavItem
              key={tab.name}
              tab={tab}
              isActive={isActive(tab.name)}
              onClick={() => navigateTo(tab.name)}
              onMouseEnter={() => handleHover(tab.path)}
            />
          ))}
        </div>

        <div className="flex items-center gap-5">
          <NavItem
            tab={tabs[3]}
            isActive={isActive(tabs[3].name)}
            onClick={() => navigateTo(tabs[3].name)}
            onMouseEnter={() => handleHover(tabs[3].path)}
          />
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            onMouseEnter={() => {}}
            className={`flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-105 ${isMenuPathActive() || moreOpen ? "text-[var(--color-primary-600)]" : "text-[var(--color-gray-400)]"}`}
            aria-label="More"
          >
            <MoreIcon size={20} />
            <span className="text-[11px] font-semibold" style={{ color: isMenuPathActive() || moreOpen ? "var(--color-primary-600)" : "var(--color-gray-400)" }}>
              {moreTab.label}
            </span>
          </button>
        </div>

        <FloatingScanButton onClick={() => navigateTo("Scan")} />
      </div>
    </div>
  );
}