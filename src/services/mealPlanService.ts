/**
 * Service for managing daily meal planning.
 * Handles API calls for marking meals to cook today, completing plans, and fetching current plan.
 */
import { httpClient } from './httpClient';
import type { DailyMealPlanDto } from '../types/history';

/**
 * Service for daily meal plan operations.
 */
export class MealPlanService {
    /**
     * Mark a meal to cook today.
     * Creates or updates today's meal plan entry.
     * 
     * @param mealId - Unique meal identifier
     * @param mealName - Name of the meal
     * @param imageUrl - URL of the meal image (nullable)
     * @returns Created or updated meal plan entry
     */
    async markMealForToday(
        mealId: string,
        mealName: string,
        imageUrl: string | null
    ): Promise<DailyMealPlanDto> {
        return httpClient.post<DailyMealPlanDto>('/api/v1/meal-plan/mark', {
            mealId,
            mealName,
            imageUrl,
        });
    }

    /**
     * Get today's meal plan.
     * Returns the current meal plan for today, or null if none exists.
     * 
     * @returns Today's meal plan or null
     */
    async getTodaysMealPlan(): Promise<DailyMealPlanDto | null> {
        try {
            return await httpClient.get<DailyMealPlanDto>('/api/v1/meal-plan/today');
        } catch (error: any) {
            // Return null if no plan exists (404) or other errors
            if (error?.message?.includes('404')) {
                return null;
            }
            console.error('Error fetching meal plan:', error);
            return null;
        }
    }

    /**
     * Clear today's meal plan.
     * Removes the current meal plan for today.
     */
    async clearMealPlan(): Promise<void> {
        await httpClient.delete<void>('/api/v1/meal-plan/today');
    }

    /**
     * Mark today's meal plan as completed (cooked).
     * This logs the meal to cooking history and marks the plan as completed.
     * 
     * @returns Updated meal plan entry with completed status
     */
    async completeMealPlan(): Promise<DailyMealPlanDto> {
        return httpClient.post<DailyMealPlanDto>('/api/v1/meal-plan/complete', {});
    }
}

/** Singleton meal plan service instance used throughout the application. */
export const mealPlanService = new MealPlanService();
