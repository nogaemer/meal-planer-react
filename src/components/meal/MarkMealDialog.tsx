/**
 * Dialog for selecting a meal to cook today from user's meal library.
 * Displays meals in a grid with search functionality.
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Search } from 'lucide-react';
import { httpClient } from '@/services/httpClient';
import type { Meal } from '@/types/meal';
import { formatMinutes } from '@/utils/time';

interface MarkMealDialogProps {
    /** Whether dialog is open */
    isOpen: boolean;
    /** Callback to close dialog */
    onClose: () => void;
    /** Callback when a meal is selected */
    onMealSelected: (mealId: string, mealName: string, imageUrl: string | null) => Promise<void>;
    /** Loading state during meal marking */
    isLoading?: boolean;
}

/**
 * MarkMealDialog - Dialog for selecting a meal to mark for cooking today
 * 
 * Features:
 * - Search meals by name
 * - Grid display of meals with images
 * - Loading and error states
 * - Click to select and mark meal
 * 
 * @param isOpen - Dialog open state
 * @param onClose - Close dialog callback
 * @param onMealSelected - Callback with selected meal info
 * @param isLoading - Loading state during API call
 */
export const MarkMealDialog: React.FC<MarkMealDialogProps> = ({
    isOpen,
    onClose,
    onMealSelected,
    isLoading = false,
}) => {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch meals when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetchMeals();
        }
    }, [isOpen]);

    // Fetch meals from API
    const fetchMeals = async () => {
        try {
            setFetchLoading(true);
            setError(null);

            const filter = {
                limit: 50,
                skip: 0,
                sortBy: 'RELEVANCE',
                name: searchQuery || undefined,
            };

            const data = await httpClient.post<{ results: Meal[] }>(
                `/api/v1/meals/search`,
                filter
            );

            setMeals(data.results);
        } catch (err: any) {
            console.error('Error fetching meals:', err);
            setError(err?.message || 'Failed to load meals');
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle search with debouncing
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            fetchMeals();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    // Handle meal selection
    const handleMealClick = async (meal: Meal) => {
        const imageUrl = meal.images?.[0]?.thumbnail || null;
        await onMealSelected(meal.id, meal.name, imageUrl);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Mark a meal to cook today</DialogTitle>
                    <DialogDescription>
                        Select a meal from your library to plan for today
                    </DialogDescription>
                </DialogHeader>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search meals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>

                {/* Meals grid */}
                <ScrollArea className="h-[400px] w-full">
                    {fetchLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : meals.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <p>No meals found. Try a different search.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-1">
                            {meals.map((meal) => {
                                const imageUrl = meal.images?.[0]?.thumbnail || '/meal-placeholder.png';
                                
                                return (
                                    <button
                                        key={meal.id}
                                        onClick={() => handleMealClick(meal)}
                                        disabled={isLoading}
                                        className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {/* Meal image */}
                                        <div className="aspect-video w-full overflow-hidden bg-muted">
                                            <img
                                                src={imageUrl}
                                                alt={meal.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Meal info */}
                                        <div className="p-3 space-y-1">
                                            <h4 className="font-medium line-clamp-1">{meal.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {meal.time > 0 && (
                                                    <span>{formatMinutes(meal.time)}</span>
                                                )}
                                                {meal.rating > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        ⭐ {meal.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
