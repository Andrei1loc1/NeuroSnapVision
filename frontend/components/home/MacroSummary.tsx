import { Droplet, Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type MacroColor = "emerald" | "sky" | "amber";

interface MacroItem {
  label: string;
  value: string;
  percent: number;
}

interface MacroSummaryProps {
  macros?: MacroItem[];
}

const defaultMacros: (MacroItem & { color: MacroColor; icon: typeof Target })[] = [
    { label: "Protein", value: "102g", percent: 72, color: "emerald" as MacroColor, icon: Target },
    { label: "Carbs", value: "180g", percent: 65, color: "sky" as MacroColor, icon: Droplet },
    { label: "Fats", value: "54g", percent: 70, color: "amber" as MacroColor, icon: Flame },
];

const styles: Record<MacroColor, string> = {
    emerald: "text-emerald-500 bg-emerald-100",
    sky: "text-sky-400 bg-sky-100",
    amber: "text-amber-400 bg-amber-100",
};

const colorMap: Record<string, MacroColor> = {
  Protein: "emerald",
  Carbs: "sky",
  Fats: "amber",
};

const iconMap: Record<string, typeof Target> = {
  Protein: Target,
  Carbs: Droplet,
  Fats: Flame,
};

export default function MacroSummary({ macros: propMacros }: MacroSummaryProps) {
    const macros = propMacros
      ? propMacros.map((m) => ({
          ...m,
          color: colorMap[m.label] ?? "emerald" as MacroColor,
          icon: iconMap[m.label] ?? Target,
        }))
      : defaultMacros;
    return (
        <section className="mx-6 mt-4 grid grid-cols-3 gap-3">
            {macros.map((macro ) => {
                const Icon = macro.icon;

                return (
                    <div
                        key={macro.label}
                        className="rounded-[24px] border border-white bg-white/20 p-4 shadow-[0_16px_40px_rgba(20,83,45,0.07)] backdrop-blur-xl"
                    >
                        <div className="mb-5 flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full ${styles[macro.color]}`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>

                            <span className="text-xs font-semibold text-zinc-500">
                {macro.label}
                </span>
                        </div>

                        <p className="mb-4 text-[24px] font-semibold leading-none text-zinc-900">
                            {macro.value}
                        </p>

                        <div className="flex items-center gap-3">
                            <Progress value={macro.percent} color={macro.color as "emerald" | "sky" | "amber"} className="h-2 bg-zinc-100" />
                            <span className="text-xs font-medium text-zinc-400">
                {macro.percent}%
              </span>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}