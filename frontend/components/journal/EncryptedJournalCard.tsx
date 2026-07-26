"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { getUserItem, setUserItem } from "@/lib/auth/userStorage";

const ENC_KEY = "neurosnap_journal_key";

async function getKey(): Promise<CryptoKey> {
  const key = getUserItem(ENC_KEY);
  if (key) {
    const raw = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
  }
  const raw = crypto.getRandomValues(new Uint8Array(32));
  setUserItem(ENC_KEY, btoa(String.fromCharCode(...raw)));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}

async function encrypt(text: string): Promise<{ encryptedEntry: string; iv: string }> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    encryptedEntry: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decrypt(encryptedEntry: string, iv: string): Promise<string> {
  const key = await getKey();
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encBytes = Uint8Array.from(atob(encryptedEntry), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, encBytes);
  return new TextDecoder().decode(decrypted);
}

interface EncryptedEntry {
  id: string;
  date: string;
  encryptedEntry: string;
  iv: string;
}

export default function EncryptedJournalCard() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<{ date: string; content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setDecrypted] = useState<Record<string, string>>({});

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data?: EncryptedEntry[] } | EncryptedEntry[]>("/api/journal/encrypted");
      const data = (res as { data?: EncryptedEntry[] })?.data ?? (res as EncryptedEntry[]);
      if (Array.isArray(data)) {
        const decoded: { date: string; content: string }[] = [];
        for (const entry of data as EncryptedEntry[]) {
          try {
            const content = await decrypt(entry.encryptedEntry, entry.iv);
            decoded.push({ date: entry.date, content });
            setDecrypted((prev) => ({ ...prev, [entry.id]: content }));
          } catch {
            decoded.push({ date: entry.date, content: "(nu se poate decripta)" });
          }
        }
        decoded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(decoded);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEntries();
  }, [loadEntries]);

  async function handleSave() {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const { encryptedEntry, iv } = await encrypt(text.trim());
      const today = new Date().toISOString().split("T")[0];
      await apiFetch("/api/journal/encrypted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, encryptedEntry, iv }),
      });
      setText("");
      await loadEntries();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="mx-5 mt-2 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-zinc-600" />
        <p className="text-[11px] text-zinc-700">Jurnal criptat end-to-end · cheia e doar pe acest device</p>
      </div>

      <div className="mx-5">
        <div className="glass-card card-animate rounded-2xl p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Scrie o reflecție personală..."
            rows={4}
            className="w-full rounded-xl border border-zinc-200 bg-white/40 px-3.5 py-3 text-[13px] text-zinc-700 placeholder:text-zinc-400 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-[12px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
            {saving ? "Se criptează..." : "Criptează & salvează"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
        </div>
      ) : entries.length === 0 ? (
        <div className="mx-5 mt-2">
          <div className="glass-card card-animate flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
            <p className="text-[13px] font-semibold text-zinc-700">
              Nicio reflecție salvată încă
            </p>
            <p className="flex items-center gap-1 text-[12px] italic text-zinc-600">
              Scrie prima ta reflecție
              <ArrowRight className="h-3 w-3 shrink-0 text-zinc-600" />
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-5 mt-2 space-y-2 pb-32">
          {entries.slice(0, 10).map((entry, i) => (
            <div key={i} className="glass-card card-animate rounded-2xl p-3.5">
              <p className="mb-1.5 text-[10px] font-medium text-zinc-700">
                {new Date(entry.date).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-[12px] leading-relaxed text-zinc-600">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}