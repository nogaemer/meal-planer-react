import {useNavigate, useParams} from "react-router-dom";
import {MealComponent} from "@/components/meal/MealComponent.tsx";

export const MealPage = () => {
    const {id: mealId} = useParams();
    const navigate = useNavigate()

    if (!mealId || mealId === "undefined") {
        console.log("No mealId provided")
        navigate("/dashboard")
        return
    }

    return (
        <div className="flex relative h-full overflow-y-scroll  sm:px-10 justify-center bg-accent" style={{scrollbarWidth: "none"}}>
                <MealComponent mealId={mealId} isCardInit={false} isFullScreen={true} className={"max-w-7xl overflow-visible"}/>
        </div>

    )
}