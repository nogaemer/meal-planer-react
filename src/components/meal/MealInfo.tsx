import React from "react";
import {cn} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Clock4} from "lucide-react";
import {formatMinutes} from "@/utils/time.ts";

interface MealInfoProps {
    difficulty?: string;
    time?: number;
    loading: boolean;
    small?: boolean;
}

/**
 * MealInfo - Displays difficulty level and preparation time badges
 *
 * Shows two info blocks:
 * 1. Difficulty indicator (3 horizontal bars, filled based on difficulty: easy/medium/hard)
 * 2. Preparation time with clock icon
 *
 * @param {string} [difficulty] - Difficulty level: "easy", "medium", or "hard"
 * @param {number} [time] - Preparation time in minutes
 * @param {boolean} loading - Whether to show skeleton loading state
 * @param {boolean} [small] - Compact display mode (removes backdrop and border)
 *
 * @returns {JSX.Element} Two-column info display with difficulty and time
 */
export const MealInfo: React.FC<MealInfoProps & React.HTMLAttributes<HTMLDivElement>> =
    ({
         difficulty,
         time,
         loading,
         small,
         className,
         ...props
    }: (MealInfoProps & React.HTMLAttributes<HTMLDivElement>)) => {

    return (
    <div className={cn("flex gap-3", className)} {...props}>
        {/* Difficulty indicator badge */}
        <div
            className={`flex items-center gap-2 ${small ? "" : "bg-background/80 backdrop-blur-sm rounded-3xl border p-3"}`}>
            {/* Three horizontal bars representing difficulty level (bottom bar always filled) */}
            <div className="flex shrink-0 items-center flex-col gap-1.5 justify-center size-10 bg-accent rounded-2xl">
                <div
                    className={`w-5 h-0.5 rounded ${difficulty === "hard" ? "bg-accent-foreground" : "bg-muted-foreground"}`}/>
                <div
                    className={`w-5 h-0.5 rounded ${difficulty !== "easy" ? "bg-accent-foreground" : "bg-muted-foreground"}`}/>
                <div className={`w-5 h-0.5 rounded bg-accent-foreground`}/>
            </div>
            <div className="flex flex-col gap-0.5 overflow-hidden">
                {(loading) ?
                    <>
                        <Skeleton className="w-20 h-5 rounded"/>
                        <Skeleton className="w-20 h-5 rounded"/>
                    </>
                    :
                    <>
                        <span className="text-muted-foreground text-xs font-normal truncate">Schwierigkeitsgrad</span>
                        <span className="text-foreground text-xs font-medium">{difficulty}</span>
                    </>}
            </div>
        </div>

        {/* Preparation time badge */}
        <div
            className={`flex px-3 items-center gap-2 ${small ? "" : "bg-background/80 backdrop-blur-sm rounded-3xl border p-3"}`}>
            <div className="flex shrink-0 items-center justify-center size-10 bg-accent rounded-2xl">
                <Clock4 className="text-accent-foreground size-6"/>
            </div>
            <div className="flex flex-col gap-0.5  overflow-hidden">
                {(loading || !time) ?
                    <>
                        <Skeleton className="w-20 h-5 rounded"/>
                        <Skeleton className="w-20 h-5 rounded"/>
                    </>
                    :
                    <>
                        <span className="text-muted-foreground text-xs font-normal truncate">Zubereitungszeit</span>
                        <span className="text-foreground text-xs font-medium">{formatMinutes(time as number)}</span>
                    </>}
            </div>
        </div>
    </div>
)};
