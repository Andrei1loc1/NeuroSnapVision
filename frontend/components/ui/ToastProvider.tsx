"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 3000;

const TYPE_STYLES: Record<
  ToastType,
  { ring: string; bg: string; iconBg: string; iconColor: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    ring: "ring-emerald-200/60",
    bg: "bg-emerald-50/80",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    Icon: CheckCircle2,
  },
  error: {
    ring: "ring-rose-200/60",
    bg: "bg-rose-50/80",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    Icon: AlertCircle,
  },
  info: {
    ring: "ring-zinc-200/60",
    bg: "bg-zinc-50/80",
    iconBg: "bg-zinc-100",
    iconColor: "text-zinc-600",
    Icon: Info,
  },
};

function ToastPortal({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(92vw,340px)] flex-col gap-2"
    >
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type];
        const Icon = s.Icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/60 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] ring-1 backdrop-blur-xl animate-[toast-in_0.25s_ease-out] ${s.bg} ${s.ring}`}
          >
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${s.iconBg}`}>
              <Icon className={`h-4 w-4 ${s.iconColor}`} />
            </div>
            <p className="flex-1 pt-0.5 text-[13px] font-medium leading-snug text-zinc-700">
              {t.message}
            </p>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Închide"
              className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/60 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        if (next.length > MAX_TOASTS) next.splice(0, next.length - MAX_TOASTS);
        return next;
      });
      const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast trebuie folosit în interiorul <ToastProvider>");
  }
  return ctx;
}