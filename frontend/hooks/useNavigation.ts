"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, BookOpen, Camera, ClipboardCheck, Ellipsis, User, BarChart3, HeartPulse, FlaskConical } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type TabName = "Home" | "Journal" | "Scan" | "Protocol" | "More";

export interface Tab {
  name: TabName;
  path: string;
  icon: LucideIcon;
  label: string;
}

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}

const tabs: Tab[] = [
  { name: "Home", path: "/", icon: Home, label: "Acasă" },
  { name: "Journal", path: "/journal", icon: BookOpen, label: "Jurnal" },
  { name: "Scan", path: "/vision-ai", icon: Camera, label: "Scan" },
  { name: "Protocol", path: "/protocol", icon: ClipboardCheck, label: "Ritual" },
  { name: "More", path: "#", icon: Ellipsis, label: "Mai mult" },
];

export const menuItems: MenuItem[] = [
  { name: "bio-age", path: "/bio-age", icon: HeartPulse, label: "Stil Viață", description: "Vârsta Stilului de Viață și dimensiuni" },
  { name: "experiments", path: "/experiments", icon: FlaskConical, label: "Experimente", description: "Testează ipoteze despre sănătatea ta" },
  { name: "reports", path: "/reports", icon: BarChart3, label: "Rapoarte", description: "Analize și istoric" },
  { name: "profile", path: "/profile", icon: User, label: "Profil", description: "Date personale și obiective" },
];

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): TabName | null => {
    const currentTab = tabs.find((tab) => tab.path === pathname);
    return currentTab?.name ?? null;
  };

  const navigateTo = (tab: TabName) => {
    const selectedTab = tabs.find((t) => t.name === tab);
    if (selectedTab) {
      router.push(selectedTab.path);
    }
  };

  const navigateToPath = (path: string) => {
    router.push(path);
  };

  const isActive = (tabName: TabName): boolean => {
    const active = getActiveTab();
    return active !== null && active === tabName;
  };

  const isMenuPathActive = (): boolean => {
    return menuItems.some((item) => item.path === pathname);
  };

  return {
    tabs,
    activeTab: getActiveTab(),
    getActiveTab,
    navigateTo,
    navigateToPath,
    isActive,
    isMenuPathActive,
  };
}