import {useNavigate, useParams} from "react-router-dom";
import {MealForm} from "@/components/meal/edit/MealForm.tsx";
import {useEffect, useState} from "react";
import type {Meal} from "@/types/meal.ts";
import {httpClient} from "@/services/httpClient.ts";

export const MealEditPage = () => {
    const {id: mealId} = useParams();
    const navigate = useNavigate()
    const [meal, setMeal] = useState<Meal>()

    useEffect(() => {
        if (!mealId || mealId === "undefined") {
            navigate("/dashboard");
        }

        (async () => {
            try {
                const res = await httpClient.get<Meal>(`/api/v1/meals/${mealId}`);
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
        <MealForm id={mealId} mealInit={meal}/>
    )
}