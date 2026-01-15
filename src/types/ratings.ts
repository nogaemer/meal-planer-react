/**
 * Rating type definitions for meal ratings and user rating responses.
 */
import type {UserResponse} from "@/types/auth.ts";

/**
 * Individual meal rating submitted by a user.
 */
export interface Rating {
    /** Unique rating identifier (present after creation) */
    id?: string;
    /** ID of the meal being rated */
    mealId: string;
    /** Rating value, typically 0-5 scale */
    rating: number;
    /** When the rating was first created (ISO string) */
    date?: string | null;
    /** When the rating was last modified (ISO string) */
    modifiedDate?: string | null;
    /** ID of the user who created the rating */
    userId?: string | null;
}

/**
 * Rating paired with user information for display purposes.
 */
export interface UserMealRatingResponse {
    /** The rating data */
    rating: Rating;
    /** User who submitted the rating */
    user: UserResponse;
}

/**
 * Complete rating information for a meal including all individual ratings and aggregate score.
 */
export interface RatingResponse {
    /** All ratings for the meal with user information */
    ratings: UserMealRatingResponse[];
    /** Average rating across all ratings for this meal */
    mealRating: number;
}
