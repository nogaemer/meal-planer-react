/**
 * Hook for managing cooking history state with pagination.
 * Fetches and manages paginated cooking history entries.
 */
import { useState, useEffect, useCallback } from 'react';
import { historyService } from '@/services/historyService';
import type { MealCookHistoryDto } from '@/types/history';

/**
 * Return type for useCookHistory hook.
 */
interface UseCookHistoryReturn {
    /** List of history entries */
    history: MealCookHistoryDto[];
    /** Whether data is currently loading */
    isLoading: boolean;
    /** Whether more pages are available */
    hasMore: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Load the next page of history */
    loadMore: () => Promise<void>;
    /** Refresh history from the beginning */
    refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing user's cooking history.
 * Supports pagination with load more functionality.
 * 
 * @param userId - User identifier (used for cache key)
 * @param initialLimit - Number of items per page (default: 20)
 * @returns History data, loading state, and pagination controls
 * 
 * @example
 * const { history, isLoading, hasMore, loadMore, refresh } = useCookHistory(userId);
 */
export function useCookHistory(
    userId: string,
    initialLimit: number = 20
): UseCookHistoryReturn {
    const [history, setHistory] = useState<MealCookHistoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    /**
     * Fetch a page of history entries.
     */
    const fetchHistory = useCallback(
        async (page: number, append: boolean = false) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await historyService.fetchUserHistory(page, initialLimit);

                if (append) {
                    setHistory((prev) => [...prev, ...response.content]);
                } else {
                    setHistory(response.content);
                }

                setHasMore(!response.last);
                setCurrentPage(page);
            } catch (err: any) {
                console.error('Error fetching cooking history:', err);
                setError(err?.message || 'Failed to load cooking history');
            } finally {
                setIsLoading(false);
            }
        },
        [initialLimit]
    );

    /**
     * Load the next page of history.
     */
    const loadMore = useCallback(async () => {
        if (!isLoading && hasMore) {
            await fetchHistory(currentPage + 1, true);
        }
    }, [isLoading, hasMore, currentPage, fetchHistory]);

    /**
     * Refresh history from the beginning.
     */
    const refresh = useCallback(async () => {
        setCurrentPage(0);
        await fetchHistory(0, false);
    }, [fetchHistory]);

    // Initial fetch on mount or when userId changes
    useEffect(() => {
        refresh();
    }, [userId]); // Only depend on userId to avoid infinite loops

    return {
        history,
        isLoading,
        hasMore,
        error,
        loadMore,
        refresh,
    };
}
