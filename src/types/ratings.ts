import type {UserResponse} from "@/types/auth.ts";

export interface Rating {
    id?: string;
    mealId: string;
    rating: number;
    date?: string | null;
    modifiedDate?: string | null;
    userId?: string | null;
}

export interface UserMealRatingResponse {
    rating: Rating;
    user: UserResponse;
}

export interface RatingResponse {
    ratings: UserMealRatingResponse[];
    mealRating: number;
}
