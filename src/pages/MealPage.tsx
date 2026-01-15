/**
 * MealPage - Full-screen meal detail view for individual meal items
 */

import {useNavigate, useParams} from "react-router-dom";
import {MealComponent} from "@/components/meal/MealComponent.tsx";

/**
 * MealPage component - Displays detailed meal information in full-screen mode
 * 
 * Extracts mealId from URL params and renders the meal component with full details.
 * Redirects to dashboard if mealId is missing or invalid.
 * 
 * @returns Full-screen meal detail view
 */
export const MealPage = () => {
    const {id: mealId} = useParams();
    const navigate = useNavigate()

    // Validate mealId and redirect if invalid
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