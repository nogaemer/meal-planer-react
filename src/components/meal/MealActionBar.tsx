import React from "react";
import {MealInfo} from "@/components/meal/MealInfo.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CalendarPlus, Share2} from "lucide-react";
import {useDailyMealPlan} from "@/hooks/useDailyMealPlan.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import type {Meal} from "@/types/meal.ts";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton.tsx";

interface MealActionBarProps {
    meal: Meal | null;
    loading: boolean;
}

export const MealActionBar: React.FC<MealActionBarProps> = ({meal, loading}) => {
    const {user} = useAuth();
    // Using default empty string for user ID if not authenticated, hook handles null user check or service might fail but we catch errors.
    // Ideally useAuth provides a guaranteed user if we are in this protected route, but MealComponent might be used differently.
    const {markMealForToday} = useDailyMealPlan(user?.id || "");

    const handleShare = async () => {
        if (!meal) return;
        const url = window.location.href;

        // Try native share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: meal.name,
                    text: `Check out this meal: ${meal.name}`,
                    url: url,
                });
                return;
            } catch {
                // If user cancels or share fails, fall back to clipboard
                console.debug('Share API failed or cancelled');
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const handleCookToday = async () => {
        if(!meal) return;
        await markMealForToday(meal.id, meal.name, meal.images?.[0]?.thumbnail || null);
    }

    if (loading) {
        return (
            <div className="flex w-full items-center bg-card rounded-3xl border p-2 pl-4 pr-2 gap-4 h-[72px]">
                 <Skeleton className="h-10 w-24 rounded-xl" />
                 <div className="h-8 w-px bg-border" />
                 <Skeleton className="size-10 rounded-full" />
                 <Skeleton className="size-10 rounded-full" />
            </div>
        );
    }

    if (!meal) return null;

    return (
        <div className="flex w-full items-center bg-card rounded-2xl p-2 justify-between scrollbar-hide">
            <MealInfo difficulty={meal.difficulty} time={meal.time} loading={loading} small />

            <div className="flex gap-2 shrink-0">
                <Button
                    variant="accentVariant"
                    size="icon"
                    onClick={handleCookToday}
                    title="Cook Today"
                    className="rounded-xl size-10"
                >
                    <CalendarPlus className="size-5" />
                </Button>

                <Button
                    variant="accent"
                    size="icon"
                    onClick={handleShare}
                    title="Share meal"
                    className="rounded-xl size-10"
                >
                    <Share2 className="size-5" />
                </Button>
            </div>
        </div>
    );
};
