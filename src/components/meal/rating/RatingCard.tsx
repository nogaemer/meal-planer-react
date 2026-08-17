/**
 * Rating card component displaying meal ratings with average and user-specific rating interface.
 */

import React, {useEffect, useState} from "react";
import {Card} from "@/components/ui/card.tsx";
import {List, ListItems, ListShape, ListText} from "@/components/ui/list.tsx";
import {useAuth} from "@/hooks/useAuth.ts";
import {httpClient} from "@/services/httpClient.ts";
import UserRating from "@/components/meal/rating/UserRating.tsx";
import type {Rating, RatingResponse} from "@/types/ratings.ts";
import {cn} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

interface RatingComponentProps {
    mealId: string | null;
}

/**
 * Displays meal ratings including average rating and list of user ratings.
 * Authenticated users can submit or update their own rating.
 *
 * @param mealId - ID of the meal to display ratings for
 * @returns Card with average rating, user's interactive rating, and list of all ratings
 */
const RatingCard: React.FC<RatingComponentProps & React.HTMLProps<HTMLDivElement>> = ({
                                                                                          mealId,
                                                                                          className,
                                                                                          ...props
                                                                                      }) => {
    const {user, isAuthenticated} = useAuth();
    const [ratingsData, setRatingsData] = useState<RatingResponse | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [existingRatingId, setExistingRatingId] = useState<string | null>(null);
    const [loading, setIsLoading] = useState(true);
    const [, setIsSubmitting] = useState(false);

    // Fetch ratings when meal ID changes
    useEffect(() => {
        if (mealId) {
            fetchRatings();
        } else setIsLoading(true);
    }, [mealId]);

    /**
     * Fetches ratings from API and initializes user's existing rating if found.
     *
     * @param updateLoading - Whether to show loading state (default: true)
     */
    const fetchRatings = async (updateLoading: boolean = true): Promise<void> => {
        if (updateLoading) setIsLoading(true);
        try {
            const data = await httpClient.get<RatingResponse>(`/api/v1/ratings/${mealId}`);
            setRatingsData(data);

            // Find the current user's rating if authenticated
            if (user && data.ratings) {
                const userRatingEntry = data.ratings.find(
                    r => r.user.id === user.id
                );
                if (userRatingEntry) {
                    setUserRating(userRatingEntry.rating.rating);
                    setExistingRatingId(userRatingEntry.rating.id ?? null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        } finally {
            if (updateLoading) setIsLoading(false);
        }
    };

    /**
     * Submits a new rating or updates existing rating for the current user.
     *
     * @param newRating - Rating value (1-5)
     */
    const submitRating = async (newRating: number): Promise<void> => {
        if (!isAuthenticated || !user || !mealId) return;

        setIsSubmitting(true);
        try {
            const ratingData: Rating = {
                mealId: mealId,
                rating: newRating,
                userId: user.id,
            };

            // Update existing rating or create new one based on existingRatingId
            if (existingRatingId) {
                // Update existing rating
                await httpClient.put(`/api/v1/ratings/${existingRatingId}`, ratingData);
            } else {
                // Create new rating
                await httpClient.post('/api/v1/ratings', ratingData);
            }

            setUserRating(newRating);
            await fetchRatings(false); // Refresh data without loading state
        } catch (error) {
            console.error('Failed to submit rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className={cn("py-5 px-5 pt-8 rounded-3xl w-full xl:shrink-0 xl:w-100 h-fit", className)} {...props}>
            {/* Ratings header */}
            {loading ?
                <Skeleton className="min-h-6"/>
                :
                <p className="text-foreground text-xl font-medium leading-none">
                    Ratings
                </p>
            }
            {/* Average rating display */}
            {loading ?
                <Skeleton className="min-h-14 rounded-2xl"/>
                :
                <ListItems round="all">
                    <ListText>Durchschnit</ListText>
                    <ListShape shape="star">
                        <ListText color="white">{ratingsData?.mealRating?.toFixed(1)}</ListText>
                    </ListShape>
                </ListItems>
            }
            {/* User rating and list of all ratings */}
            {loading ?
                <div className="flex flex-col gap-0.5 overflow-auto">
                    <Skeleton className="min-h-14 rounded-b-md rounded-t-2xl"/>
                    <Skeleton className="min-h-14 rounded-md"/>
                    <Skeleton className="min-h-14 rounded-md"/>
                    <Skeleton className="min-h-14 rounded-t-md rounded-b-2xl"/>
                </div>
                :
                <RatingList ratings={ratingsData?.ratings} user={user!} existingRatingId={existingRatingId}
                            userRating={userRating} onSubmit={submitRating}/>
            }
        </Card>
    )
};

interface RatingListProps {
    ratings?: RatingResponse['ratings'];
    user: { id?: string; name?: string }
    existingRatingId: string | null;
    userRating: number;
    onSubmit: (rating: number) => void;
}

/**
 * Renders the user's interactive rating row followed by other users' ratings.
 * Applies proper border rounding based on list position.
 */
const RatingList: React.FC<RatingListProps> = ({ratings, user, userRating, onSubmit, existingRatingId}) => (
    <List>
        {/* Current user's rating with interactive stars */}
        <UserRating user={user} userRating={userRating} onSubmit={onSubmit} round={ratings?.length ? "top" : "all"}
                    existingRatingId={existingRatingId}/>

        {/* Other users' ratings (excluding current user) */}
        {ratings?.filter(r => r.user.id != user.id).map((rating, idx, arr) => {
            // Apply correct border rounding based on position in list
            let round: "top" | "none" | "all" | "bottom";
            if (idx === arr.length - 1) round = "bottom";
            else round = "none";

            return (
                <ListItems key={rating.rating.id ?? idx} round={round}>
                    <ListText>{rating.user.name}</ListText>
                    <ListShape shape="star">
                        <ListText color="white">{rating.rating.rating}</ListText>
                    </ListShape>
                </ListItems>
            );
        })}
    </List>
);

export default RatingCard;