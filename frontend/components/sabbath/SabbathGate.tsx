"use client";

import { useState, useEffect } from "react";
import { useSabbath } from "@/hooks/useSabbath";
import SabbathScreen from "./SabbathScreen";

export default function SabbathGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isSabbath, loading } = useSabbath();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <>{children}</>;
  }

  if (isSabbath) {
    return <SabbathScreen />;
  }

  return <>{children}</>;
}