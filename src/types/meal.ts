export interface MealIngredient {
    ingredient: Ingredient;
    amount: string;
    unit: Unit;
}

export interface Ingredient {
    id: string;
    name: string;
    category: string;
    unit: Unit;
}

export interface Unit {
    id: string;
    abbreviation: string;
    abbreviationPlural: string;
    fullName: string;
    fullNamePlural: string;
    countable: boolean;
    category: string;
    description: string;
}

export interface Image {
    thumbnail: string;
    srcSetArray: string[];
    srcSetString: string;
    deleteUrls: string[] | null;
}

export interface Tag {
    id: string;
    name: string;
    type: string;
    description: string;
    color: string;
}

export interface Rating {
    mealId: string;
    rating: number;
    date: string;
    modifiedDate: string;
    id: string;
    userId: string;
}

export interface MealFilter {
    name?: string;
    minTime?: number;
    maxTime?: number;
    ingredients?: string[];
    minIngredientMatch?: number;
    userIds?: string[];
    minUserRating?: number;
    requireUserRatingMatch?: boolean;
    sortBy?: string;
    limit?: number;
    skip?: number;
}

export interface Meal {
    id: string;
    name: string;
    description: string;
    ingredients: MealIngredient[];
    instructions: string[];
    images: Image[];
    difficulty: string;
    time: number;
    portions: number;
    calories: number;
    url: string;
    tags: Tag[];
    rating: number;
    ratings: Rating[];
    notes: string[];
}

export interface MealUpload {
    name: string;
    ingredients: MealIngredient[],
    instructions: string[],
    tags: Tag[],
    images: Image[];
    difficulty: string,
    time: number,
    portions: number,
    calories: number
}

export interface SortParameter {
    id: string;
    name: string;
    selected: boolean;
}