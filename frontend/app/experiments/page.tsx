"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Plus,
  X,
  Loader2,
  Trash2,
  CheckCircle2,
  Pause,
  Play,
  CalendarDays,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { apiFetch } from "@/lib/api/client";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  protocol: Record<string, unknown>;
  status: string;
  startDate: string;
  endDate: string | null;
  results: Record<string, unknown> | null;
  templateId: string | null;
}

type Status = "PLANNING" | "RUNNING" | "COMPLETED" | "PAUSED";
type FilterTab = "all" | "active" | "completed";

interface ExperimentsResponse {
  data?: Experiment[];
}

const STATUS_LABELS: Record<Status, string> = {
  PLANNING: "Planificat",
  RUNNING: "În desfășurare",
  COMPLETED: "Finalizat",
  PAUSED: "Pauzat",
};

const STATUS_STYLES: Record<Status, string> = {
  PLANNING: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60",
  RUNNING: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60",
  COMPLETED: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/60",
  PAUSED: "bg-rose-50 text-rose-600 ring-1 ring-rose-200/60",
};

const METRICS = [
  { key: "stressLevel", label: "Nivel de stres", icon: "🧘" },
  { key: "sleepScore", label: "Calitatea somnului", icon: "😴" },
  { key: "nutritionScore", label: "Scor nutriție", icon: "🥗" },
  { key: "biologicalAge", label: "Vârstă biologică", icon: "⏳" },
  { key: "energy", label: "Energie zilnică", icon: "⚡" },
  { key: "recovery", label: "Recuperare", icon: "🔋" },
  { key: "focus", label: "Focus mental", icon: "🎯" },
  { key: "mood", label: "Dispoziție", icon: "🙂" },
];

interface Template {
  id: string;
  name: string;
  emoji: string;
  hypothesis: string;
  metric: string;
  durationDays: number;
  frequency: string;
  protocol: Record<string, unknown>;
}

const TEMPLATES: Template[] = [
  {
    id: "cold",
    name: "Duș rece",
    emoji: "❄️",
    hypothesis: "Dușurile reci de 2 min timp de 30 zile reduc stresul perceput",
    metric: "stressLevel",
    durationDays: 30,
    frequency: "zilnic",
    protocol: { duration: "2 min", frequency: "zilnic", metric: "stressLevel" },
  },
  {
    id: "fast",
    name: "Post 16:8",
    emoji: "🍽️",
    hypothesis: "Fereastra de mâncare 16:8 îmbunătățește scorul metabolic",
    metric: "nutritionScore",
    durationDays: 28,
    frequency: "zilnic",
    protocol: { window: "8h", metric: "nutritionScore" },
  },
  {
    id: "sleep",
    name: "Culcare 22:30",
    emoji: "🌙",
    hypothesis: "Culcarea la 22:30 timp de 21 zile îmbunătățește somnul",
    metric: "sleepScore",
    durationDays: 21,
    frequency: "zilnic",
    protocol: { bedtime: "22:30", metric: "sleepScore" },
  },
  {
    id: "walk",
    name: "10k pași",
    emoji: "🚶",
    hypothesis: "10.000 de pași zilnic timp de 30 zile reduc vârsta biologică",
    metric: "biologicalAge",
    durationDays: 30,
    frequency: "zilnic",
    protocol: { target: "10000", metric: "biologicalAge" },
  },
  {
    id: "caffeine",
    name: "Fără cafeină după 14:00",
    emoji: "☕",
    hypothesis: "Oprirea cafeinei după 14:00 îmbunătățește calitatea somnului",
    metric: "sleepScore",
    durationDays: 14,
    frequency: "zilnic",
    protocol: { cutoff: "14:00", metric: "sleepScore" },
  },
  {
    id: "screen",
    name: "Fără ecrane după 21:00",
    emoji: "📵",
    hypothesis: "Fără ecrane după 21:00 timp de 14 zile îmbunătățește recuperarea",
    metric: "recovery",
    durationDays: 14,
    frequency: "zilnic",
    protocol: { cutoff: "21:00", metric: "recovery" },
  },
];

function getProgress(exp: Experiment): { daysElapsed: number; totalDays: number; pct: number; daysLeft: number } {
  const start = new Date(exp.startDate);
  const now = new Date();
  const totalDays = (exp.protocol?.durationDays as number) ?? 0;
  const daysElapsed = Math.max(0, Math.round((now.getTime() - start.getTime()) / 86400000));
  const pct = totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;
  const daysLeft = Math.max(0, totalDays - daysElapsed);
  return { daysElapsed, totalDays, pct, daysLeft };
}

function formatDateRO(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function ExperimentsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    hypothesis: "",
    templateId: "",
    metric: "stressLevel",
    durationDays: 21,
    frequency: "zilnic",
  });

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiFetch<ExperimentsResponse | Experiment[]>("/api/experiments");
      const data = (res as ExperimentsResponse)?.data ?? (res as Experiment[]);
      if (Array.isArray(data)) setExperiments(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/onboarding");
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await apiFetch<ExperimentsResponse | Experiment[]>("/api/experiments");
        const data = (res as ExperimentsResponse)?.data ?? (res as Experiment[]);
        if (active && Array.isArray(data)) {
          setExperiments(data);
        }
      } catch {
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, router]);

  const filtered = useMemo(() => {
    if (filter === "active") {
      return experiments.filter((e) => e.status === "RUNNING" || e.status === "PLANNING" || e.status === "PAUSED");
    }
    if (filter === "completed") {
      return experiments.filter((e) => e.status === "COMPLETED");
    }
    return experiments;
  }, [experiments, filter]);

  const stats = useMemo(() => {
    const active = experiments.filter((e) => e.status === "RUNNING").length;
    const completed = experiments.filter((e) => e.status === "COMPLETED").length;
    const planned = experiments.filter((e) => e.status === "PLANNING").length;
    const completionRate = experiments.length > 0
      ? Math.round((completed / experiments.length) * 100)
      : 0;
    return { active, completed, planned, completionRate, total: experiments.length };
  }, [experiments]);

  function applyTemplate(templateId: string) {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (t) {
      setForm({
        name: t.name,
        hypothesis: t.hypothesis,
        templateId,
        metric: t.metric,
        durationDays: t.durationDays,
        frequency: t.frequency,
      });
    } else {
      setForm((prev) => ({ ...prev, templateId: "" }));
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.hypothesis.trim() || saving) return;
    setSaving(true);
    try {
      const template = TEMPLATES.find((t) => t.id === form.templateId);
      const protocol = template?.protocol ?? {
        metric: form.metric,
        durationDays: form.durationDays,
        frequency: form.frequency,
      };
      await apiFetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          hypothesis: form.hypothesis.trim(),
          protocol,
          templateId: template?.id ?? null,
        }),
      });
      setForm({ name: "", hypothesis: "", templateId: "", metric: "stressLevel", durationDays: 21, frequency: "zilnic" });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("[experiments] failed to save experiment", err);
      alert("Nu am putut salva experimentul. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: Status) {
    try {
      const body: Record<string, unknown> = { status };
      if (status === "COMPLETED") body.endDate = new Date().toISOString();
      await apiFetch(`/api/experiments?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      console.error("[experiments] failed to update experiment status", err);
      alert("Nu am putut actualiza statusul experimentului. Încearcă din nou.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/experiments?id=${id}`, { method: "DELETE" });
      setExperiments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("[experiments] failed to delete experiment", err);
      alert("Nu am putut șterge experimentul. Încearcă din nou.");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  if (!user) return null;

  return (
    <div className="pt-10 space-y-2 pb-14">
      {/* Header */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Înapoi"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm transition-colors hover:bg-white/60"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-700" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Experimente</h1>
            <p className="text-[11px] text-zinc-600">Testează ipoteze despre sănătatea ta</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? "Închide formularul" : "Creează experiment nou"}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      {/* Summary stats */}
      {!loading && experiments.length > 0 && (
        <section className="glass-card card-animate mx-5 mt-2 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
                <Play className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-lg font-bold leading-none text-zinc-900">{stats.active}</p>
              <p className="mt-1 text-[10px] font-medium text-zinc-700">Active</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 ring-1 ring-zinc-200/60">
                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="mt-2 text-lg font-bold leading-none text-zinc-900">{stats.completed}</p>
              <p className="mt-1 text-[10px] font-medium text-zinc-700">Finalizate</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-lg font-bold leading-none text-zinc-900">{stats.completionRate}%</p>
              <p className="mt-1 text-[10px] font-medium text-zinc-700">Reușită</p>
            </div>
          </div>
        </section>
      )}

      {/* Filter tabs */}
      {!loading && experiments.length > 0 && (
        <div className="mx-5 flex rounded-2xl bg-white/30 p-1 backdrop-blur-sm">
          {([
            { key: "all", label: "Toate", count: stats.total },
            { key: "active", label: "Active", count: stats.active + stats.planned },
            { key: "completed", label: "Finalizate", count: stats.completed },
          ] as { key: FilterTab; label: string; count: number }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "text-zinc-700 hover:text-zinc-900"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                filter === tab.key ? "bg-white/20" : "bg-zinc-100 text-zinc-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Wizard / Create form */}
      {showForm && (
        <section className="glass-card card-animate mx-5 rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-emerald-500" />
            <p className="text-[13px] font-semibold text-zinc-700">Experiment nou</p>
          </div>

          {/* Templates */}
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Template</p>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    form.templateId === t.id
                      ? "border-emerald-400 bg-emerald-50/60 ring-1 ring-emerald-300/50"
                      : "border-zinc-200 bg-white/40 hover:border-emerald-200"
                  }`}
                >
                  <span className="text-base leading-none">{t.emoji}</span>
                  <span className={`text-[11px] font-semibold leading-tight ${
                    form.templateId === t.id ? "text-emerald-700" : "text-zinc-600"
                  }`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Nume</p>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex. Duș rece dimineața"
              className="w-full rounded-xl border border-zinc-200 bg-white/40 px-3 py-2.5 text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            />
          </div>

          {/* Hypothesis */}
          <div className="mb-4">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Ipoteză</p>
            <textarea
              value={form.hypothesis}
              onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
              placeholder="Ce vrei să testezi? ex. Dușurile reci reduc stresul perceput"
              rows={2}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white/40 px-3 py-2.5 text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            />
          </div>

          {/* Metric + Duration */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Metrică</p>
              <select
                value={form.metric}
                onChange={(e) => setForm({ ...form, metric: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white/40 px-3 py-2.5 text-[13px] text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {METRICS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Durată (zile)</p>
              <input
                type="number"
                min={1}
                max={365}
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) || 1 })}
                className="w-full rounded-xl border border-zinc-200 bg-white/40 px-3 py-2.5 text-[13px] text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!form.name.trim() || !form.hypothesis.trim() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Se salvează..." : "Creează experiment"}
          </button>
        </section>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mx-5 mt-2 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : experiments.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200/50">
            <FlaskConical className="h-7 w-7 text-emerald-400" />
          </div>
          <p className="text-[13px] font-semibold text-zinc-600">Niciun experiment încă</p>
          <p className="mx-auto mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-zinc-400">
            Alege un template sau creează un experiment custom pentru a testa ce funcționează pentru tine.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60 transition-all hover:bg-emerald-100 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Începe primul experiment
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[13px] font-medium text-zinc-500">Nimic în această categorie</p>
          <p className="mt-1 text-[11px] text-zinc-400">Schimbă filtrul pentru a vedea alte experimente</p>
        </div>
      ) : (
        <div className="mx-5 space-y-2.5">
          {filtered.map((exp) => {
            const status = exp.status as Status;
            const progress = getProgress(exp);
            const metricKey = (exp.protocol?.metric as string) ?? "stressLevel";
            const metricLabel = METRICS.find((m) => m.key === metricKey)?.label ?? metricKey;
            const template = exp.templateId ? TEMPLATES.find((t) => t.id === exp.templateId) : null;

            return (
              <div key={exp.id} className="glass-card card-animate rounded-2xl p-4">
                {/* Top row: name + status + delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {template && <span className="text-sm leading-none">{template.emoji}</span>}
                      <p className="truncate text-[14px] font-semibold text-zinc-800">{exp.name}</p>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-zinc-500">{exp.hypothesis}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.PLANNING}`}>
                      {STATUS_LABELS[status] ?? exp.status}
                    </span>
                    {confirmDeleteId === exp.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition-colors hover:bg-rose-200"
                          aria-label="Confirmă ștergerea"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500"
                          aria-label="Anulează ștergerea"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(exp.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-rose-50 hover:text-rose-400"
                        aria-label="Șterge"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Meta: metric + dates */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {metricLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDateRO(exp.startDate)}
                    {exp.endDate ? ` → ${formatDateRO(exp.endDate)}` : progress.totalDays > 0 ? ` · ${progress.totalDays}z` : ""}
                  </span>
                  {progress.totalDays > 0 && status === "RUNNING" && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <Clock className="h-3 w-3" />
                      {progress.daysLeft}z rămase
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {progress.totalDays > 0 && (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/50">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          status === "COMPLETED"
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                            : status === "PAUSED"
                            ? "bg-zinc-300"
                            : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        }`}
                        style={{ width: `${status === "COMPLETED" ? 100 : progress.pct}%` }}
                      />
                    </div>
                    {status === "RUNNING" && (
                      <p className="mt-1.5 text-[10px] font-medium text-zinc-700">
                        Ziua {Math.min(progress.daysElapsed + 1, progress.totalDays)} din {progress.totalDays}
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {status === "PLANNING" && (
                    <button
                      onClick={() => handleStatusChange(exp.id, "RUNNING")}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/50 transition-all hover:bg-emerald-100 active:scale-95"
                    >
                      <Play className="h-2.5 w-2.5" />
                      Pornește
                    </button>
                  )}
                  {status === "PAUSED" && (
                    <button
                      onClick={() => handleStatusChange(exp.id, "RUNNING")}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/50 transition-all hover:bg-emerald-100 active:scale-95"
                    >
                      <Play className="h-2.5 w-2.5" />
                      Relua
                    </button>
                  )}
                  {status === "RUNNING" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(exp.id, "COMPLETED")}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/50 transition-all hover:bg-emerald-100 active:scale-95"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Finalizează
                      </button>
                      <button
                        onClick={() => handleStatusChange(exp.id, "PAUSED")}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/50 transition-all hover:bg-amber-100 active:scale-95"
                      >
                        <Pause className="h-2.5 w-2.5" />
                        Pauză
                      </button>
                    </>
                  )}
                  {status === "COMPLETED" && (
                    <button
                      onClick={() => handleStatusChange(exp.id, "RUNNING")}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1.5 text-[10px] font-semibold text-zinc-600 ring-1 ring-zinc-200/60 transition-all hover:bg-zinc-100 active:scale-95"
                    >
                      <ArrowRight className="h-2.5 w-2.5" />
                      Reia
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}