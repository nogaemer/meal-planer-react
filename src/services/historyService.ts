/**
 * Service for managing meal cooking history.
 * Handles API calls for logging meals, fetching history, and retrieving cooking statistics.
 */
import { httpClient } from './httpClient';
import type { MealCookHistoryDto, HistoryPage } from '../types/history';

/**
 * Service for cooking history operations including logging meals and fetching history.
 */
export class HistoryService {
    /**
     * Fetch paginated cooking history for the current user.
     * 
     * @param page - Page number (0-indexed)
     * @param pageSize - Number of items per page
     * @returns Paginated history entries
     */
    async fetchUserHistory(page: number = 0, pageSize: number = 20): Promise<HistoryPage> {
        return httpClient.get<HistoryPage>(
            `/api/v1/history?page=${page}&size=${pageSize}`
        );
    }

    /**
     * Fetch cooking history for a specific meal.
     * 
     * @param mealId - Unique meal identifier
     * @param page - Page number (0-indexed)
     * @param pageSize - Number of items per page
     * @returns Paginated history entries for the meal
     */
    async fetchMealHistory(
        mealId: string,
        page: number = 0,
        pageSize: number = 20
    ): Promise<HistoryPage> {
        return httpClient.get<HistoryPage>(
            `/api/v1/history/meal/${mealId}?page=${page}&size=${pageSize}`
        );
    }

    /**
     * Fetch the most recent cooking history entries.
     * Useful for displaying recent activity.
     * 
     * @param limit - Maximum number of entries to fetch
     * @returns List of recent history entries
     */
    async fetchRecentHistory(limit: number = 10): Promise<MealCookHistoryDto[]> {
        return httpClient.get<MealCookHistoryDto[]>(
            `/api/v1/history/recent?limit=${limit}`
        );
    }

    /**
     * Get the last time a specific meal was cooked.
     * 
     * @param mealId - Unique meal identifier
     * @returns ISO datetime string of last cook time, or null if never cooked
     */
    async fetchLastCookDate(mealId: string): Promise<string | null> {
        try {
            const response = await httpClient.get<{ lastCookedAt: string | null }>(
                `/api/v1/history/meal/${mealId}/last`
            );
            return response.lastCookedAt;
        } catch (error) {
            console.error('Error fetching last cook date:', error);
            return null;
        }
    }

    /**
     * Log that a meal was cooked.
     * Creates a history entry with optional rating, notes, and portion information.
     * 
     * @param mealId - Unique meal identifier
     * @param portionSize - Optional portion size (number of servings)
     * @param rating - Optional rating (1-5 stars)
     * @param notes - Optional cooking notes/comments
     * @returns Created history entry
     */
    async logMealCooked(
        mealId: string,
        portionSize?: number,
        rating?: number,
        notes?: string
    ): Promise<MealCookHistoryDto> {
        const payload: {
            portionSize?: number;
            rating?: number;
            notes?: string;
        } = {};

        if (portionSize !== undefined) payload.portionSize = portionSize;
        if (rating !== undefined) payload.rating = rating;
        if (notes !== undefined && notes.trim()) payload.notes = notes.trim();

        return httpClient.post<MealCookHistoryDto>(
            `/api/v1/history/${mealId}/log`,
            payload
        );
    }
}

/** Singleton history service instance used throughout the application. */
export const historyService = new HistoryService();
