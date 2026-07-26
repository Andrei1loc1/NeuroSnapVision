"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
    // After installing @sentry/nextjs, replace the line above with:
    //   import * as Sentry from "@sentry/nextjs";
    //   Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200/50">
        <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-zinc-800">Ceva n-a mers bine</h2>
      <p className="mt-1 text-xs text-zinc-500">A apărut o eroare neașteptată</p>
      <button
        onClick={reset}
        className="mt-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
      >
        Reîncearcă
      </button>
    </div>
  );
}