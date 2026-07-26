"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteJournalMeal } from "@/lib/api/journal";

type DeleteMealButtonProps = {
    mealId: string;
    mealTitle: string;
    onDeleted?: (mealId: string) => void;
};

export default function DeleteMealButton({
    mealId,
    mealTitle,
    onDeleted,
}: DeleteMealButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        const confirmed = window.confirm(`Ștergi "${mealTitle}" din jurnal?`);
        if (!confirmed) return;

        try {
            setIsDeleting(true);
            await deleteJournalMeal(mealId);
            onDeleted?.(mealId);
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Șterge ${mealTitle}`}
            className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-red-50/90 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-100 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <Trash2 className="h-3.5 w-3.5" />
        </button>
    );
}
