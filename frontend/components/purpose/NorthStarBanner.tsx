"use client";

import { useState, useEffect } from "react";
import { usePurpose } from "@/hooks/usePurpose";
import { Star, X } from "lucide-react";
import { Portal } from "@/components/ui/Portal";

const EXAMPLES = [
  "Să fiu prezent pentru familia mea la 80 de ani",
  "Să am energia să călătoresc și să descopăr lumea",
  "Să fiu un model de sănătate pentru copiii mei",
  "Să am claritatea mentală să îmi construiesc visul",
];

export default function NorthStarBanner() {
  const { purpose, loading, savePurpose } = usePurpose();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleOpen() {
    setText(purpose?.northStar ?? "");
    setOpen(true);
  }

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await savePurpose({ northStar: text.trim() });
      setOpen(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-5 mt-2">
        <div className="h-9 w-56 animate-pulse rounded-full bg-zinc-200/30" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-5 mt-2">
        {purpose?.northStar ? (
          <button
            onClick={handleOpen}
            className="group flex w-full items-center gap-2.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-amber-100/40 px-4 py-2.5 text-left shadow-sm shadow-amber-500/5 transition-all hover:shadow-md hover:shadow-amber-500/10 active:scale-[0.98]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Star className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-zinc-700">
                &ldquo;{purpose.northStar}&rdquo;
              </p>
              <p className="text-[10px] text-zinc-400">North Star-ul tău</p>
            </div>
          </button>
        ) : (
          <button
            onClick={handleOpen}
            className="group flex w-full items-center gap-2.5 rounded-full border border-dashed border-amber-300/60 bg-gradient-to-r from-amber-50/60 to-amber-100/30 px-4 py-2.5 transition-all hover:border-amber-400/80 hover:from-amber-50/90 hover:to-amber-100/50 hover:shadow-md hover:shadow-amber-500/10 active:scale-[0.98]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Star className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[12px] font-semibold text-amber-700">
                Care e motivul tău?
              </p>
              <p className="text-[10px] text-amber-500">Definește-ți North Star-ul</p>
            </div>
          </button>
        )}
      </div>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[430px] animate-slide-up rounded-t-[28px] border border-white/30 bg-white/80 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Star className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">North Star</h2>
                  <p className="text-[11px] text-zinc-600">Motivul tău profund</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Închide"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2">
              <p className="text-sm font-medium text-zinc-700">
                De ce vrei să fii sănătos?
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Nu un număr pe cântar. Un motiv care contează cu adevărat.
              </p>
            </div>

            <div className="px-5">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) handleSave(); }}
                placeholder="Ex: Să fiu prezent pentru familia mea la 80 de ani"
                autoFocus
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus:border-emerald-400 transition-all"
              />
            </div>

            <div className="px-5 mt-4">
              <p className="text-[11px] font-medium text-zinc-600 mb-2">Ai nevoie de inspirație?</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setText(ex)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] transition-all ${
                      text === ex
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pt-5 pb-8">
              <button
                onClick={handleSave}
                disabled={!text.trim() || saving}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:shadow-none"
              >
                {saving ? "Se salvează..." : purpose?.northStar ? "Actualizează" : "Salvează"}
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}