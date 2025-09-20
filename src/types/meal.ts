export interface Ingredient {
    name: string;
    amount: string;
    unit: string;
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
    meals: string[];
}

export interface Rating {
    mealId: string;
    rating: number;
    date: string;
    modifiedDate: string;
    id: string;
    userId: string;
}

export interface Meal {
    id: string;
    name: string;
    ingredients: Ingredient[];
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