/**
 * MealEditPage - Page for editing existing meal entries
 */

import {useNavigate, useParams} from "react-router-dom";
import {MealForm} from "@/components/meal/edit/MealForm.tsx";
import {useEffect, useState} from "react";
import type {Meal} from "@/types/meal.ts";
import {httpClient} from "@/services/httpClient.ts";

/**
 * MealEditPage component - Fetches and displays a meal for editing
 * 
 * Extracts mealId from URL, fetches meal data from API, and passes it to MealForm.
 * Handles loading state and redirects to dashboard if meal is not found or invalid.
 * 
 * @returns Page with pre-populated meal form for editing existing meals
 */
export const MealEditPage = () => {
    const {id: mealId} = useParams();
    const navigate = useNavigate()
    const [meal, setMeal] = useState<Meal>()

    // Fetch meal data on component mount
    useEffect(() => {
        if (!mealId || mealId === "undefined") {
            navigate("/dashboard");
        }

        (async () => {
            try {
                const res = await httpClient.get<Meal>(`/api/v1/meals/${mealId}`);
                // Handle potential response wrapper
                const data = (res && 'data' in (res as any)) ? (res as any).data : res;
                setMeal(data);
            } catch (err) {
                console.error(err);
                navigate("/dashboard");
            }
        })();

    }, [mealId, navigate]);

    if (!mealId || mealId === "undefined") {
        return null;
    }

    if (!meal) {
        return <div className="flex h-screen items-center justify-center">Laden...</div>;
    }

    return (
        <div className="h-full overflow-y-auto">
            <MealForm id={mealId} mealInit={meal} />
        </div>
    )
}