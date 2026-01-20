/**
 * Type definitions for meal cooking history and daily meal planning features.
 */

/**
 * Individual cooking history entry for a meal.
 * Records when a meal was cooked with optional rating, notes, and portion details.
 */
export interface MealCookHistoryDto {
    /** Unique history entry identifier */
    id: string;
    /** ID of the meal that was cooked */
    mealId: string;
    /** Name of the meal at the time it was cooked */
    mealName: string;
    /** URL of the meal image (nullable) */
    mealImageUrl: string | null;
    /** ID of the user who cooked the meal */
    userId: string;
    /** When the meal was cooked (ISO datetime string) */
    cookedAt: string;
    /** Optional rating given when cooking (1-5 stars) */
    rating?: number;
    /** Optional notes/comments about cooking experience */
    notes?: string;
    /** Optional portion size (e.g., number of servings) */
    portionSize?: number;
}

/**
 * Daily meal plan entry representing a meal marked to cook today.
 * Tracks planning and completion status.
 */
export interface DailyMealPlanDto {
    /** Unique meal plan entry identifier */
    id: string;
    /** ID of the meal planned to cook */
    mealId: string;
    /** Name of the meal */
    mealName: string;
    /** URL of the meal image (nullable) */
    mealImageUrl: string | null;
    /** Date the meal is planned for (ISO date string, e.g., "2026-01-20") */
    plannedDate: string;
    /** When the meal was marked for this day (ISO datetime string) */
    markedAt: string;
    /** Whether the meal has been cooked/completed */
    isCompleted: boolean;
    /** When the meal was marked as cooked (ISO datetime string, null if not completed) */
    completedAt: string | null;
}

/**
 * Paginated response wrapper for history entries.
 */
export interface HistoryPage {
    /** List of history entries for current page */
    content: MealCookHistoryDto[];
    /** Current page number (0-indexed) */
    page: number;
    /** Number of items per page */
    size: number;
    /** Total number of items across all pages */
    totalElements: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether this is the last page */
    last: boolean;
}
