/**
 * MealCreatePage - Page for creating new meal entries
 */

import {MealForm} from "@/components/meal/edit/MealForm.tsx";

/**
 * MealCreatePage component - Renders the meal creation form
 * 
 * Displays an empty MealForm component for creating a new meal.
 * No initial data is passed - all fields start empty.
 * 
 * @returns Page with empty meal form for creating new meals
 */
export const MealCreatePage = () => {
    return (
        <div className="h-full overflow-y-auto">
            <MealForm id={undefined} mealInit={undefined}/>
        </div>
    )
}