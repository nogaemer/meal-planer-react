/**
 * Hook for calculating cooking history statistics.
 * Provides statistics like total meals cooked, average rating, and most cooked meal.
 */
import { useMemo } from 'react';
import type { MealCookHistoryDto } from '@/types/history';

interface HistoryStats {
    /** Total number of meals cooked */
    totalMeals: number;
    /** Average rating across all rated meals */
    avgRating: number;
    /** Most frequently cooked meal with its count */
    mostCooked: { name: string; count: number } | null;
}

/**
 * Calculate statistics from cooking history entries.
 * 
 * @param history - Array of cooking history entries
 * @returns Calculated statistics object
 * 
 * @example
 * const stats = useHistoryStats(history);
 * console.log(`Total meals: ${stats.totalMeals}`);
 */
export function useHistoryStats(history: MealCookHistoryDto[]): HistoryStats {
    return useMemo(() => {
        if (history.length === 0) {
            return {
                totalMeals: 0,
                avgRating: 0,
                mostCooked: null,
            };
        }

        const totalMeals = history.length;
        const ratingsCount = history.filter((h) => h.rating).length;
        const avgRating =
            ratingsCount > 0
                ? history.reduce((sum, h) => sum + (h.rating || 0), 0) / ratingsCount
                : 0;

        // Find most cooked meal
        const mealCounts: Record<string, { name: string; count: number }> = {};
        history.forEach((entry) => {
            if (!mealCounts[entry.mealId]) {
                mealCounts[entry.mealId] = { name: entry.mealName, count: 0 };
            }
            mealCounts[entry.mealId].count++;
        });

        const mostCooked = Object.values(mealCounts).sort((a, b) => b.count - a.count)[0];

        return {
            totalMeals,
            avgRating,
            mostCooked,
        };
    }, [history]);
}
