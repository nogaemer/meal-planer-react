import {useNavigate, useParams} from "react-router-dom";
import {MealEditHeader} from "@/components/meal/edit/MealEditHeader.tsx";
import {MealEditMetaData} from "@/components/meal/edit/MealEditMetaData.tsx";
import {MealEditImageContainer} from "@/components/meal/edit/MealEditImageContainer.tsx";
import {MealEditInstructions} from "@/components/meal/edit/MealEditInstructions.tsx";
import {MealEditIngredients} from "@/components/meal/edit/MealEditIngredients.tsx";

export const MealEditPage = () => {
    const {id: mealId} = useParams();
    const navigate = useNavigate()

    if (!mealId || mealId === "undefined") {
        console.log("No mealId provided")
        navigate("/dashboard")
        return
    }

    return (
        <div className="flex relative h-screen overflow-y-scroll  p-5 sm:px-10 justify-center bg-accent" style={{scrollbarWidth: "none"}}>
            <div className="flex flex-col w-full max-w-7xl gap-4">
                <MealEditHeader/>
                <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-4 w-2/3">
                        <MealEditMetaData/>
                        <MealEditInstructions/>
                    </div>
                    <div className="flex flex-col gap-4 w-lg">
                        <MealEditImageContainer/>
                        <MealEditIngredients />
                    </div>
                </div>
            </div>
        </div>
    )
}