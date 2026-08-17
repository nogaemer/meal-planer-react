/**
 * Modal displaying cooking history for a specific meal.
 * Shows list of times the meal was cooked with ratings and notes.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Star, Calendar } from 'lucide-react';
import { historyService } from '@/services/historyService.ts';
import type { MealCookHistoryDto } from '@/types/history.ts';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface CookHistoryModalProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Callback to close modal */
    onClose: () => void;
    /** ID of meal to show history for */
    mealId: string;
    /** Name of meal for display */
    mealName: string;
    /** Optional last cooked timestamp for quick display */
    lastCookedAt?: string;
}

/**
 * CookHistoryModal - Modal displaying cooking history for a specific meal
 * 
 * Features:
 * - Paginated history list with load more
 * - Shows date, rating, notes for each entry
 * - Last cooked date display at top
 * - Loading and empty states
 * 
 * @param isOpen - Modal open state
 * @param onClose - Close modal callback
 * @param mealId - Meal identifier
 * @param mealName - Meal name for title
 * @param lastCookedAt - Optional last cooked timestamp
 */
export const CookHistoryModal: React.FC<CookHistoryModalProps> = ({
    isOpen,
    onClose,
    mealId,
    mealName,
    lastCookedAt,
}) => {
    const [history, setHistory] = useState<MealCookHistoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const pageSize = 10;

    // Fetch page of history
    const fetchHistory = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await historyService.fetchMealHistory(mealId, page, pageSize);
            
            if (page === 0) {
                setHistory(response.content);
            } else {
                setHistory((prev) => [...prev, ...response.content]);
            }

            setHasMore(!response.last);
            setCurrentPage(page);
        } catch (err: any) {
            console.error('Error fetching history:', err);
            setError(err?.message || 'Failed to load cooking history');
        } finally {
            setIsLoading(false);
        }
    }, [mealId, pageSize]);

    // Fetch history when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchHistory(0);
        } else {
            // Reset state when closed
            setHistory([]);
            setCurrentPage(0);
            setHasMore(false);
        }
    }, [isOpen, fetchHistory]);

    // Load next page
    const loadMore = () => {
        if (!isLoading && hasMore) {
            fetchHistory(currentPage + 1);
        }
    };

    // Format date for display
    const formatDate = (isoDateTime: string) => {
        try {
            const date = parseISO(isoDateTime);
            return format(date, 'MMM d, yyyy • HH:mm');
        } catch {
            return isoDateTime;
        }
    };

    // Format relative time
    const formatRelativeTime = (isoDateTime: string) => {
        try {
            return formatDistanceToNow(parseISO(isoDateTime), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{mealName} - Cooking History</DialogTitle>
                    <DialogDescription>
                        {lastCookedAt && (
                            <span className="flex items-center gap-2 mt-2">
                                <Calendar className="h-4 w-4" />
                                Last cooked: {formatRelativeTime(lastCookedAt)}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] w-full pr-4">
                    {isLoading && history.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Calendar className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-center">No cooking history for this meal yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-lg border bg-card p-4 space-y-2"
                                >
                                    {/* Date and time */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(entry.cookedAt)}</span>
                                        </div>
                                        {entry.rating && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                {entry.rating}/5
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Portion size */}
                                    {entry.portionSize && (
                                        <div className="text-sm text-muted-foreground">
                                            Portion: {entry.portionSize} {entry.portionSize === 1 ? 'serving' : 'servings'}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {entry.notes && (
                                        <div className="text-sm bg-muted/50 p-2 rounded">
                                            {entry.notes}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Load more button */}
                            {hasMore && (
                                <div className="flex justify-center pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
