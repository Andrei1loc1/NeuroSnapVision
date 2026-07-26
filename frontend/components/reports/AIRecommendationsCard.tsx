import { Leaf, TrendingUp } from "lucide-react";
import type { SmartRecommendation } from "@/lib/types";

interface AIRecommendationsCardProps {
  smartRecommendations?: SmartRecommendation[];
  recommendations?: { title: string; description: string }[];
}

function parseImpact(impact: string): number {
  const match = impact.match(/-?[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export default function AIRecommendationsCard({
  smartRecommendations,
  recommendations: legacyRecs,
}: AIRecommendationsCardProps) {
  const hasSmart = smartRecommendations && smartRecommendations.length > 0;

  const items = hasSmart
    ? [...smartRecommendations]
        .sort((a, b) => parseImpact(b.impact) - parseImpact(a.impact))
        .map((r) => ({
          title: r.title,
          description: r.description,
          impact: r.impact,
          current: r.current,
          target: r.target,
          icon: TrendingUp,
        }))
    : legacyRecs
      ? legacyRecs.map((r) => ({
          title: r.title,
          description: r.description,
          impact: undefined as string | undefined,
          current: undefined as number | undefined,
          target: undefined as number | undefined,
          icon: r.title.toLowerCase().includes("protein") ? TrendingUp : Leaf,
        }))
      : [];

  return (
    <section className="glass-card card-animate mx-5 mt-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-zinc-600">
          Recomandări Personalizate
        </p>

        {items.length > 0 && (
          <button className="text-xs font-bold text-emerald-500">
            Vezi toate
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-[12px] font-medium text-zinc-400">
          Recomandările apar după ce loghezi câteva zile de mese și activitate.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/70 bg-white/40 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-emerald-400" />

                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {item.description}
                    </p>

                    {item.impact && (
                      <span className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Impact: {item.impact}
                      </span>
                    )}

                    {item.current !== undefined && item.target !== undefined && (
                      <span className="ml-1.5 text-[10px] font-medium text-zinc-400">
                        {item.current} → {item.target}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
