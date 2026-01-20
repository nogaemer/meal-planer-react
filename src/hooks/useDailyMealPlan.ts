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

    // Initial fetch on mount
    useEffect(() => {
        fetchMealPlan();
    }, [fetchMealPlan]);

    // Poll for updates every 5 minutes to catch auto-completed plans,
    // but pause polling when the tab is not visible to reduce unnecessary calls.
    useEffect(() => {
        // In non-browser environments (e.g. SSR), skip setting up polling.
        if (typeof document === 'undefined') {
            return;
        }

        let intervalId: number | undefined;

        const startPolling = () => {
            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }

            intervalId = window.setInterval(() => {
                // Only fetch when the document is visible.
                if (document.visibilityState === 'visible') {
                    fetchMealPlan();
                }
            }, 5 * 60 * 1000); // 5 minutes
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // When the tab becomes visible, refresh immediately and resume polling.
                fetchMealPlan();
                startPolling();
            } else if (intervalId !== undefined) {
                // Pause polling while the tab is hidden.
                window.clearInterval(intervalId);
                intervalId = undefined;
            }
        };

        // Start polling when the hook mounts.
        startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
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
