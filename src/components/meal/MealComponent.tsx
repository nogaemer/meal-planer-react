import React, {useEffect} from "react";
import {useAuth} from "@/hooks/useAuth.ts";
import IngredientsCard from "@/components/meal/IngredientsCard.tsx";
import RatingCard from "@/components/meal/rating/RatingCard.tsx";
import type {Meal} from "@/types/meal.ts";
import InstructionsCard from "@/components/meal/InstructionsCard.tsx";
import {MealCoverImage} from "@/components/meal/MealCoverImage.tsx";
import {httpClient} from "@/services/httpClient.ts";
import {cn} from "@/lib/utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

interface MealPageProps {
    mealId: string;
    loadingImage?: string;
    isCardInit?: boolean;
    isFullScreen?: boolean;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    rounded?: {
        borderTopLeftRadius: string;
        borderTopRightRadius: string;
        borderBottomLeftRadius: string;
        borderBottomRightRadius: string;
    }
    shouldClose?: boolean;
}

export const MealComponent: React.FC<MealPageProps & React.HTMLAttributes<HTMLDivElement>> = ({
    mealId,
    loadingImage,
    isCardInit = true,
    isFullScreen = false,
    top,
    left,
    width,
    height,
    rounded,
    shouldClose,
    className,
    ...props
}) => {
    const {user, isAuthenticated} = useAuth();
    const [isCard, setIsCard] = React.useState(isCardInit);
    const [meal, setMeal] = React.useState<Meal | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const mealRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mealId && isAuthenticated && user) {
            fetchMeal();
        }
    }, [mealId, isAuthenticated, user]);

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
        if (isFullScreen) return;

        setIsCard(true); // Initial state
        requestAnimationFrame(() => {
            setIsCard(false); // Start transition after paint
        });
    }, [isFullScreen]);

    useEffect(() => {
        if (!shouldClose) return;

        setIsCard(true);
        mealRef.current!.scrollTo({top: 0, behavior: 'smooth'});
    }, [shouldClose]);

    return (
        <div
            className={cn(`bg-accent transition-[height,max-width,top,left,translate,border-radius] duration-1000 w-full overflow-x-hidden ${!isFullScreen && "absolute"}
            ${!isFullScreen && (isCard ? `overflow-clip` : "h-[calc(100vh-2.5rem)] xl:max-w-7xl max-w-xl overflow-scroll rounded-[2.5rem] transform -translate-x-1/2 -translate-y-1/2")}`,
            className)}
            style={{
                ...(!isFullScreen && (isCard ? {top, left, height, maxWidth: width} : {top: "50%", left: "50%"})),
                scrollbarWidth: "none",
                ...(rounded && !isFullScreen && isCard
                    ? {
                        borderTopLeftRadius: rounded.borderTopLeftRadius,
                        borderTopRightRadius: rounded.borderTopRightRadius,
                        borderBottomLeftRadius: rounded.borderBottomLeftRadius,
                        borderBottomRightRadius: rounded.borderBottomRightRadius,
                    }
                    : {}),
            }}
            {...props}
            ref={mealRef}>
            <div className={"h-full w-full"}>
                <div
                    className={`flex flex-col xl:flex-row xl:h-full gap-5 transition-[padding,width] duration-1000 ${isCard ? "p-0 w-full" : "p-2 sm:p-5 xl:w-[calc(100%-26.25rem)]"}`}>
                    <div
                        className={`flex flex-col gap-5 h-full shrink-0  transition-[width] w-full duration-1000`}>
                        <MealCoverImage meal={meal} loadingImage={loadingImage} loading={isLoading} isFullScreen={isFullScreen}
                                        description={"Hackbällchen in Tomatensauce mit Mozzarella überbacken"}
                                        isCard={isCard}/>
                        <InstructionsCard meal={meal} loading={isLoading} className="hidden md:flex "/>
                    </div>

                    <div className={`hidden md:flex flex-row-reverse xl:flex-col gap-5 xl:w-100`}>
                        <RatingCard mealId={mealId}
                                    className="hidden lg:flex overflow-hidden max-h-[max(calc(100vh-100px),500px)] transition-[width, padding]"/>
                        <IngredientsCard meal={meal} loading={isLoading} className="overflow-hidden max-h-[max(calc(100vh-100px),500px)]"/>
                    </div>

                    <Tabs defaultValue="instructions" className="md:hidden">
                        <TabsList className="w-full p-1.5 h-fit rounded-3xl">
                            <TabsTrigger value="instructions" className="px-4 py-2 rounded-2xl md:hidden">Anleitung</TabsTrigger>
                            <TabsTrigger value="ingredients" className="px-4 py-2 rounded-2xl">Zutaten</TabsTrigger>
                        </TabsList>
                        <TabsContent value="instructions" className="md:hidden">
                            <InstructionsCard meal={meal} loading={isLoading} className=" "/>
                        </TabsContent>
                        <TabsContent value="ingredients">
                            <IngredientsCard meal={meal} loading={isLoading} className="overflow-hidden sm:max-h-[max(calc(100vh-100px),500px)]"/>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}