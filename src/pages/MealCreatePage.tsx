import {MealForm} from "@/components/meal/edit/MealForm.tsx";

export const MealCreatePage = () => {
    return (
        <div className="h-full overflow-y-auto">
            <MealForm id={undefined} mealInit={undefined}/>
        </div>
    )
}