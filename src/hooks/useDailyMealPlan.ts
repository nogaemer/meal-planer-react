/**
 * Hook for managing daily meal plan state.
 * Handles fetching, updating, and completing today's meal plan with auto-refresh.
 */
import { useState, useEffect, useCallback } from 'react';
import { mealPlanService } from '@/services/mealPlanService';
import type { DailyMealPlanDto } from '@/types/history';
import { toast } from 'sonner';

/**
 * Return type for useDailyMealPlan hook.
 */
interface UseDailyMealPlanReturn {
    /** Current meal plan for today (null if none) */
    mealPlan: DailyMealPlanDto | null;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Mark a meal to cook today */
    markMealForToday: (
        mealId: string,
        mealName: string,
        imageUrl: string | null
    ) => Promise<void>;
    /** Clear today's meal plan */
    clearMealPlan: () => Promise<void>;
    /** Mark today's meal as cooked (logs to history) */
    completeMealPlan: () => Promise<void>;
    /** Manually refresh the meal plan */
    refresh: () => Promise<void>;
}

/**
 * Hook for managing today's meal plan with auto-refresh and completion tracking.
 * Polls periodically to detect auto-completed plans from previous days.
 * 
 * @param userId - User identifier (used for cache invalidation)
 * @returns Meal plan state and control functions
 * 
 * @example
 * const { mealPlan, markMealForToday, completeMealPlan, clearMealPlan } = useDailyMealPlan(userId);
 */
export function useDailyMealPlan(userId: string): UseDailyMealPlanReturn {
    const [mealPlan, setMealPlan] = useState<DailyMealPlanDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch today's meal plan from the API.
     */
    const fetchMealPlan = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const plan = await mealPlanService.getTodaysMealPlan();
            setMealPlan(plan);
        } catch (err: any) {
            console.error('Error fetching meal plan:', err);
            setError(err?.message || 'Failed to load meal plan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Mark a meal to cook today.
     */
    const markMealForToday = useCallback(
        async (mealId: string, mealName: string, imageUrl: string | null) => {
            try {
                setIsLoading(true);
                setError(null);
                const plan = await mealPlanService.markMealForToday(
                    mealId,
                    mealName,
                    imageUrl
                );
                setMealPlan(plan);
                toast.success(`${mealName} marked to cook today!`);
            } catch (err: any) {
                console.error('Error marking meal:', err);
                const errorMessage = err?.message || 'Failed to mark meal';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    /**
     * Clear today's meal plan.
     */
    const clearMealPlan = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await mealPlanService.clearMealPlan();
            setMealPlan(null);
            toast.success('Meal plan cleared');
        } catch (err: any) {
            console.error('Error clearing meal plan:', err);
            const errorMessage = err?.message || 'Failed to clear meal plan';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Mark today's meal as cooked.
     */
    const completeMealPlan = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const completedPlan = await mealPlanService.completeMealPlan();
            setMealPlan(completedPlan);
            toast.success('Meal marked as cooked! 🎉');
        } catch (err: any) {
            console.error('Error completing meal plan:', err);
            const errorMessage = err?.message || 'Failed to complete meal plan';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Manually refresh the meal plan.
     */
    const refresh = useCallback(async () => {
        await fetchMealPlan();
    }, [fetchMealPlan]);

    // Initial fetch on mount or when userId changes
    useEffect(() => {
        fetchMealPlan();
    }, [userId, fetchMealPlan]);

    // Poll for updates every 5 minutes to catch auto-completed plans
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMealPlan();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [fetchMealPlan]);

    return {
        mealPlan,
        isLoading,
        error,
        markMealForToday,
        clearMealPlan,
        completeMealPlan,
        refresh,
    };
}
