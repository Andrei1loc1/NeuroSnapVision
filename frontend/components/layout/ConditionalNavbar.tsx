"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isExcludedPage = pathname === "/vision-ai" || pathname === "/onboarding";

  if (isExcludedPage) return null;
  return <Navbar />;
}