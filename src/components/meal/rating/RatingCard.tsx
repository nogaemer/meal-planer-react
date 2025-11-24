import React, {useEffect, useState} from "react";
import {Card} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
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

    useEffect(() => {
        if (mealId) {
            fetchRatings();
        } else setIsLoading(true);
    }, [mealId]);

    const fetchRatings = async (updateLoading: boolean = true): Promise<void> => {
        if (updateLoading) setIsLoading(true);
        try {
            const data = await httpClient.get<RatingResponse>(`/api/v1/ratings/${mealId}`);
            setRatingsData(data);

            // Find the current user's rating
            if (user && data.ratings) {
                const userRatingEntry = data.ratings.find(
                    r => r.user.id === user.id
                );
                if (userRatingEntry) {
                    setUserRating(userRatingEntry.rating.rating);
                    // You'd need the rating ID for updates - might need to be included in response
                    setExistingRatingId(userRatingEntry.rating.id ?? null); // Replace it with actual ID
                }
            }
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        } finally {
            if (updateLoading) setIsLoading(false);
        }
    };

    const submitRating = async (newRating: number): Promise<void> => {
        if (!isAuthenticated || !user || !mealId) return;

        setIsSubmitting(true);
        try {
            const ratingData: Rating = {
                mealId: mealId,
                rating: newRating,
                userId: user.id,
            };

            if (existingRatingId) {
                // Update existing rating
                await httpClient.put(`/api/v1/ratings/${existingRatingId}`, ratingData);
            } else {
                // Create new rating
                await httpClient.post('/api/v1/ratings', ratingData);
            }

            setUserRating(newRating);
            await fetchRatings(false); // Refresh data
        } catch (error) {
            console.error('Failed to submit rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className={cn("py-5 px-5 pt-10 rounded-4xl w-full xl:shrink-0 xl:w-100 h-fit", className)} {...props}>
            {loading ?
                <Skeleton className="min-h-6"/>
                :
                <p className="text-foreground font-inter text-2xl font-medium leading-none">
                    Ratings
                </p>
            }
            <Separator/>
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
            <Separator/>
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

const RatingList: React.FC<RatingListProps> = ({ratings, user, userRating, onSubmit, existingRatingId}) => (
    <List>
        <UserRating user={user} userRating={userRating} onSubmit={onSubmit} round={ratings?.length ? "top" : "all"}
                    existingRatingId={existingRatingId}/>

        {ratings?.filter(r => r.user.id != user.id).map((rating, idx, arr) => {
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