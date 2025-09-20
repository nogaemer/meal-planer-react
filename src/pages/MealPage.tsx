import React, {useEffect} from "react";
import {useAuth} from "@/hooks/useAuth.ts";
import IngredientsCard from "@/components/meal/IngredientsCard.tsx";
import RatingCard from "@/components/meal/rating/RatingCard.tsx";
import type {Meal} from "@/types/meal.ts";
import InstructionsCard from "@/components/meal/InstructionsCard.tsx";
import {MealCoverImage} from "@/components/meal/MealCoverImage.tsx";
import {httpClient} from "@/services/httpClient.ts";

interface MealPageProps {
    mealId: string;
    loadingImage: string;
    fake?: boolean;
    top?: number;
    left?: number;
    shouldClose?: boolean;
}

export const MealPage: React.FC<MealPageProps & React.HTMLAttributes<HTMLDivElement>> = ({
    mealId,
    loadingImage,
    fake = false,
    top,
    left,
    shouldClose,
    ...props
}) => {
    const {user, isAuthenticated} = useAuth();
    const [isCard, setIsCard] = React.useState(true);
    const [meal, setMeal] = React.useState<Meal | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const mealRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mealId && isAuthenticated && user) {
            fetchMeal();
        }
    }, [mealId, user, isAuthenticated]);

    const fetchMeal = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const data = await httpClient.get<Meal>(`/api/v1/meals/${mealId}`);
            setMeal(data);

        } catch (error) {
            console.error('Failed to fetch meal:', error);
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        if (!fake) return;
        setIsCard(true); // Initial state
        requestAnimationFrame(() => {
            setIsCard(false); // Start transition after paint
        });
    }, []);

    useEffect(() => {
        if (!shouldClose || !fake) return;

        setIsCard(true);
        mealRef.current!.scrollTo({top: 0, behavior: 'smooth'});
    }, [shouldClose]);

    return (
        <div
            className={`bg-accent transition-[height,max-width,top,left,translate,border-radius] duration-1000 w-full overflow-x-hidden
            ${isCard ? "h-40 max-w-40 overflow-clip rounded-2xl" : "h-[calc(100vh-2.5rem)] max-w-7xl overflow-scroll rounded-[2.5rem] transform -translate-x-1/2 -translate-y-1/2"}
            ${fake ? `absolute` : "relative"}`}
            style={{
                ...(fake ? (isCard ? {top, left} : {top: "50%", left: "50%"}) : {}),
                scrollbarWidth: "none"
            }}
            ref={mealRef}>
            <div className="">
                <div
                    className={`flex h-full gap-5 transition-[padding,width] duration-1000 ${isCard ? "p-0 w-full" : "p-5 w-[calc(100%-26.25rem)]"}`} {...props}>
                    <div
                        className={`flex flex-col gap-5 h-full shrink-0  transition-[width] w-full duration-1000`}>
                        <MealCoverImage meal={meal} loadingImage={loadingImage} loading={isLoading}
                                        description={"Hackbällchen in Tomatensauce mit Mozzarella überbacken"}
                                        isCard={isCard}/>
                        <InstructionsCard meal={meal} loading={isLoading}/>
                    </div>

                    <div className={`flex flex-col gap-5 w-100 shrink-0`}>
                        <RatingCard mealId={"669e8deb2c91a20e9de8bdf0"}
                                    className="overflow-hidden max-h-[50vh] shrink-0 transition-[width, padding]"/>
                        <IngredientsCard meal={meal} loading={isLoading} className="overflow-hidden"/>
                    </div>
                </div>
            </div>
        </div>
    )
}