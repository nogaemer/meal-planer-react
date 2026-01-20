/**
 * Widget displaying today's meal plan on the dashboard.
 * Shows planned meal, status, and actions (mark as cooked, change meal).
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, X } from 'lucide-react';
import type { DailyMealPlanDto } from '@/types/history';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface TodaysMealWidgetProps {
    /** Current meal plan for today (null if none) */
    mealPlan: DailyMealPlanDto | null;
    /** Whether data is loading */
    isLoading: boolean;
    /** Handler for marking meal as cooked */
    onMarkComplete: () => Promise<void>;
    /** Handler for clearing/changing meal */
    onClear: () => Promise<void>;
    /** Handler for opening meal selection dialog */
    onSelectMeal?: () => void;
}

/**
 * TodaysMealWidget - Prominent display of today's meal plan on homepage/dashboard
 * 
 * Displays different states:
 * - Empty: Button to mark a meal
 * - Planned: Shows meal with "Mark as cooked" and "Change" buttons
 * - Completed: Shows completed meal with checkmark
 * 
 * @param mealPlan - Current meal plan for today
 * @param isLoading - Loading state
 * @param onMarkComplete - Callback to mark meal as cooked
 * @param onClear - Callback to clear/change meal
 * @param onSelectMeal - Optional callback to open meal selection dialog
 */
export const TodaysMealWidget: React.FC<TodaysMealWidgetProps> = ({
    mealPlan,
    isLoading,
    onMarkComplete,
    onClear,
    onSelectMeal,
}) => {
    // Show skeleton while loading
    if (isLoading) {
        return (
            <Card className="w-full border-2">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-32 w-32 rounded-lg" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state - no meal planned
    if (!mealPlan) {
        return (
            <Card className="w-full border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No meal planned for today</h3>
                            <p className="text-sm text-muted-foreground">
                                Mark a meal to cook today and track your progress
                            </p>
                        </div>
                        {onSelectMeal && (
                            <Button onClick={onSelectMeal} size="lg">
                                <Calendar className="mr-2 h-4 w-4" />
                                Mark a meal to cook today
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Format time from ISO datetime
    const formatTime = (isoDateTime: string) => {
        try {
            return format(parseISO(isoDateTime), 'HH:mm');
        } catch {
            return '';
        }
    };

    // Meal planned and completed
    if (mealPlan.isCompleted) {
        return (
            <Card className="w-full border-2 border-green-500/50 bg-green-500/5">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Meal image */}
                        {mealPlan.mealImageUrl && (
                            <div className="flex-shrink-0">
                                <img
                                    src={mealPlan.mealImageUrl}
                                    alt={mealPlan.mealName}
                                    className="h-32 w-32 rounded-lg object-cover"
                                />
                            </div>
                        )}

                        {/* Meal info */}
                        <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">{mealPlan.mealName}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Cooked today ✓
                                    </Badge>
                                    {mealPlan.completedAt && (
                                        <span className="text-sm text-muted-foreground">
                                            Completed at: {formatTime(mealPlan.completedAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Meal planned but not yet cooked
    return (
        <Card className="w-full border-2 border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Meal image */}
                    {mealPlan.mealImageUrl && (
                        <div className="flex-shrink-0">
                            <img
                                src={mealPlan.mealImageUrl}
                                alt={mealPlan.mealName}
                                className="h-32 w-32 rounded-lg object-cover"
                            />
                        </div>
                    )}

                    {/* Meal info and actions */}
                    <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">{mealPlan.mealName}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Planned for today
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Marked at: {formatTime(mealPlan.markedAt)}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={onMarkComplete}
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as cooked
                            </Button>
                            <Button
                                onClick={onClear}
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                title="Change meal"
                                aria-label="Change meal"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
