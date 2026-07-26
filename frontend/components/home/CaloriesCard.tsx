import { Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NUTRITION_GOALS } from "@/lib/constants/nutrition";

interface CaloriesCardProps {
  consumed?: number;
  goal?: number;
}

export default function CaloriesCard({ consumed: propConsumed, goal: propGoal }: CaloriesCardProps = {}) {
    const consumed = propConsumed ?? 0;
    const goal = propGoal ?? NUTRITION_GOALS.CALORIES;
    const percent = Math.round((consumed / goal) * 100);
    const remaining = goal - consumed;

    return (
        <section className="mx-6 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                    <span className="text-sm font-semibold text-zinc-600">Calories</span>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/30">
                    <span className="text-xs text-white">◎</span>
                </div>
            </div>

            <div className="mb-5 flex items-end justify-between">
                <div className="flex items-end gap-1">
          <span className="text-[42px] font-semibold leading-none tracking-tight text-zinc-900">
            {consumed.toLocaleString("en-US")}
          </span>
                    <span className="mb-1.5 text-sm font-medium text-zinc-400">
            / {goal.toLocaleString("en-US")} kcal
          </span>
                </div>

                <span className="mb-1 text-lg font-bold text-emerald-500">
          {percent}%
        </span>
            </div>

            <Progress
                value={percent}
                className="h-3 rounded-full bg-emerald-50/80"
            />

            <p className="mt-4 text-xs font-medium text-zinc-400">
                {remaining} kcal remaining
            </p>
        </section>
    );
}
