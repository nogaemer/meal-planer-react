/**
 * HistoryPage - View all cooking history with tabs for different views.
 * Displays history entries in a grid with optional statistics.
 */
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCookHistory } from '@/hooks/useCookHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Calendar, Star, TrendingUp, Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

/**
 * HistoryPage - Page for viewing all cooking history and statistics
 * 
 * Features:
 * - Tab 1: All cooking history with infinite scroll
 * - Tab 2: Basic cooking statistics
 * - Grid layout matching dashboard style
 * - Loading and error states
 * 
 * @returns History page with tabs and history grid
 */
const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id || '';
    const { history, isLoading, hasMore, error, loadMore } = useCookHistory(userId, 20);

    // Format date for display
    const formatDate = (isoDateTime: string) => {
        try {
            return format(parseISO(isoDateTime), 'MMM d, yyyy');
        } catch {
            return isoDateTime;
        }
    };

    // Calculate basic statistics
    const stats = React.useMemo(() => {
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

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Page header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Cooking History</h1>
                <p className="text-muted-foreground">
                    Track your cooking journey and view statistics
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Meals</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                {/* All Meals Tab */}
                <TabsContent value="all" className="space-y-6">
                    {isLoading && history.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <Card className="border-destructive">
                            <CardContent className="py-12 text-center text-destructive">
                                <p>{error}</p>
                            </CardContent>
                        </Card>
                    ) : history.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No cooking history yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start logging your meals to build your cooking history!
                                </p>
                                <Button asChild>
                                    <Link to="/dashboard">Browse Meals</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* History grid */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {history.map((entry) => (
                                    <Card key={entry.id} className="overflow-hidden">
                                        {/* Meal image */}
                                        {entry.mealImageUrl && (
                                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                                <img
                                                    src={entry.mealImageUrl}
                                                    alt={entry.mealName}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <CardContent className="p-4 space-y-3">
                                            {/* Meal name */}
                                            <Link
                                                to={`/meal/${entry.mealId}`}
                                                className="font-semibold hover:underline line-clamp-1 block"
                                            >
                                                {entry.mealName}
                                            </Link>

                                            {/* Date and rating */}
                                            <div className="flex items-center justify-between gap-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(entry.cookedAt)}
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
                                                    {entry.portionSize} {entry.portionSize === 1 ? 'serving' : 'servings'}
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {entry.notes && (
                                                <div className="text-sm bg-muted/50 p-2 rounded line-clamp-2">
                                                    {entry.notes}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Load more button */}
                            {hasMore && (
                                <div className="flex justify-center">
                                    <Button
                                        onClick={loadMore}
                                        disabled={isLoading}
                                        size="lg"
                                    >
                                        {isLoading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Total meals cooked */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Total Meals Cooked
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">{stats.totalMeals}</div>
                                <CardDescription>All time</CardDescription>
                            </CardContent>
                        </Card>

                        {/* Average rating */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Average Rating
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">
                                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
                                </div>
                                <CardDescription>
                                    {stats.avgRating > 0 ? 'Out of 5 stars' : 'No ratings yet'}
                                </CardDescription>
                            </CardContent>
                        </Card>

                        {/* Most cooked meal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Most Cooked
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.mostCooked ? (
                                    <>
                                        <div className="text-lg font-semibold line-clamp-1">
                                            {stats.mostCooked.name}
                                        </div>
                                        <CardDescription>
                                            {stats.mostCooked.count} {stats.mostCooked.count === 1 ? 'time' : 'times'}
                                        </CardDescription>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">No data yet</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coming soon section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                More Statistics Coming Soon
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                We're working on adding more detailed statistics and insights about your cooking habits!
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HistoryPage;
