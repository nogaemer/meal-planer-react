/**
 * Core meal data types including ingredients, units, filters, and meal metadata.
 * Defines the structure for meal recipes, filtering, and display.
 */

/**
 * Ingredient used in a meal recipe with quantity and unit.
 */
export interface MealIngredient {
    /** Reference to the ingredient definition */
    ingredient: Ingredient;
    /** Quantity as a string (may include fractions like "1/2") */
    amount: string;
    /** Unit of measurement for this ingredient */
    unit: Unit;
}

/**
 * Ingredient definition with categorization and default unit.
 */
export interface Ingredient {
    /** Unique ingredient identifier */
    id: string;
    /** Display name (e.g., "Tomatoes", "Olive Oil") */
    name: string;
    /** Ingredient category for organization (e.g., "Vegetables", "Spices") */
    category: string;
    /** Default unit for this ingredient */
    unit: Unit;
}

/**
 * Unit of measurement with singular/plural forms and metadata.
 */
export interface Unit {
    /** Unique unit identifier */
    id: string;
    /** Short form for singular (e.g., "g", "ml", "tsp") */
    abbreviation: string;
    /** Short form for plural (e.g., "g", "ml", "tsp") */
    abbreviationPlural: string;
    /** Full name singular (e.g., "gram", "milliliter") */
    fullName: string;
    /** Full name plural (e.g., "grams", "milliliters") */
    fullNamePlural: string;
    /** Whether this unit counts discrete items (e.g., "pieces") */
    countable: boolean;
    /** Unit category (e.g., "weight", "volume", "count") */
    category: string;
    /** Additional details about unit usage */
    description: string;
}

/**
 * Image data with responsive sources and management URLs.
 */
export interface Image {
    /** URL for thumbnail/preview version */
    thumbnail: string;
    /** Array of srcset entries for responsive images */
    srcSetArray: string[];
    /** Complete srcset string for img element */
    srcSetString: string;
    /** URLs for deleting images (null if not deletable) */
    deleteUrls: string[] | null;
}

/**
 * Tag for categorizing and filtering meals.
 */
export interface Tag {
    /** Unique tag identifier */
    id: string;
    /** Display name for the tag */
    name: string;
    /** Tag type/category */
    type: string;
    /** Detailed description of the tag */
    description: string;
    /** Color for UI display (hex or color name) */
    color: string;
}

/**
 * Individual rating entry for a meal (also defined in ratings.ts).
 */
export interface Rating {
    /** Meal being rated */
    mealId: string;
    /** Rating score */
    rating: number;
    /** Creation timestamp (ISO string) */
    date: string;
    /** Last modification timestamp (ISO string) */
    modifiedDate: string;
    /** Unique rating identifier */
    id: string;
    /** User who submitted rating */
    userId: string;
}

/**
 * Filter criteria for searching and sorting meals.
 * All fields are optional to allow flexible querying.
 */
export interface MealFilter {
    /** Filter by meal name (partial match) */
    name?: string;
    /** Minimum preparation time in minutes */
    minTime?: number;
    /** Maximum preparation time in minutes */
    maxTime?: number;
    /** List of ingredient IDs that must be present */
    ingredients?: string[];
    /** Minimum number of filter ingredients that must match */
    minIngredientMatch?: number;
    /** Filter by ratings from specific users */
    userIds?: string[];
    /** Minimum average rating (0-5) */
    minUserRating?: number;
    /** Whether to require all specified users to have rated */
    requireUserRatingMatch?: boolean;
    /** Sort parameter ID (e.g., "name-asc", "rating-desc") */
    sortBy?: string;
    /** Maximum number of results to return */
    limit?: number;
    /** Number of results to skip (for pagination) */
    skip?: number;
}

/**
 * Complete meal recipe with all metadata, ingredients, and instructions.
 */
export interface Meal {
    /** Unique meal identifier */
    id: string;
    /** Meal name/title */
    name: string;
    /** Short description or summary */
    description: string;
    /** List of ingredients with amounts */
    ingredients: MealIngredient[];
    /** Ordered cooking instructions */
    instructions: string[];
    /** Meal photos with responsive sources */
    images: Image[];
    /** Difficulty level (e.g., "Easy", "Medium", "Hard") */
    difficulty: string;
    /** Total preparation and cooking time in minutes */
    time: number;
    /** Number of servings this recipe makes */
    portions: number;
    /** Estimated calories per serving */
    calories: number;
    /** External URL if meal was imported */
    url: string;
    /** Tags for categorization */
    tags: Tag[];
    /** Average rating across all user ratings */
    rating: number;
    /** All individual ratings for this meal */
    ratings: Rating[];
    /** Additional notes or tips */
    notes: string[];
}

/**
 * Payload for creating or updating a meal (subset of Meal without generated fields).
 */
export interface MealUpload {
    /** Meal name/title */
    name: string;
    /** Ingredients with amounts and units */
    ingredients: MealIngredient[],
    /** Step-by-step instructions */
    instructions: string[],
    /** Tags for categorization */
    tags: Tag[],
    /** Associated images */
    images: Image[];
    /** Difficulty level */
    difficulty: string,
    /** Total time in minutes */
    time: number,
    /** Number of servings */
    portions: number,
    /** Calories per serving */
    calories: number
}

/**
 * Available sort option for meal queries.
 */
export interface SortParameter {
    /** Unique sort option identifier (e.g., "name-asc", "rating-desc") */
    id: string;
    /** Display name for the sort option */
    name: string;
    /** Whether this is the default selected sort */
    selected: boolean;
}