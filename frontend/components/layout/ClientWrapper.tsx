"use client";

import { useEffect } from "react";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  return <div className="ego-filter">{children}</div>;
}