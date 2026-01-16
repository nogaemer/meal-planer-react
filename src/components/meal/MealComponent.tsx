/**
 * Main meal display component with animated card-to-fullscreen transitions.
 * Handles meal data fetching, responsive layout, and tab-based mobile navigation.
 */
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

/**
 * Props for controlling meal display and animation state.
 */
interface MealPageProps {
    /** ID of the meal to display */
    mealId: string;
    /** Placeholder image during loading */
    loadingImage?: string;
    /** Whether to start in card (collapsed) state */
    isCardInit?: boolean;
    /** Whether displayed in fullscreen mode (no animation) */
    isFullScreen?: boolean;
    /** Initial top position for card state (px) */
    top?: number;
    /** Initial left position for card state (px) */
    left?: number;
    /** Initial width for card state (px) */
    width?: number;
    /** Initial height for card state (px) */
    height?: number;
    /** Border radius for card state */
    rounded?: {
        borderTopLeftRadius: string;
        borderTopRightRadius: string;
        borderBottomLeftRadius: string;
        borderBottomRightRadius: string;
    }
    /** Trigger to animate back to card state */
    shouldClose?: boolean;
    /** Whether to prioritize image loading */
    priority?: boolean;
}

/**
 * MealComponent - displays full meal details with animated transitions.
 * 
 * Supports two display modes:
 * 1. Card-to-modal: Animates from a card position to centered modal (controlled by isCardInit, top, left, width, height)
 * 2. Fullscreen: Static fullscreen display without animation (isFullScreen=true)
 * 
 * Features:
 * - Fetches meal data on mount
 * - Smooth CSS transitions between card and expanded states
 * - Responsive layout: desktop (3-column), mobile (tabs)
 * - Desktop: Cover image + instructions | ingredients + ratings
 * - Mobile: Cover image + tabbed instructions/ingredients
 * 
 * @param props.mealId - Meal ID to fetch and display.
 * @param props.isFullScreen - If true, shows static fullscreen view without card animation.
 * @param props.isCardInit - If true, starts in collapsed card state before expanding.
 * @param props.top/left/width/height - Initial card dimensions for animation.
 * @param props.shouldClose - Set true to trigger collapse back to card state.
 * @returns Meal detail view with adaptive layout and animation.
 * 
 * @example
 * // Animated from card
 * <MealComponent mealId="123" isCardInit={true} top={100} left={50} width={300} height={400} />
 * 
 * // Fullscreen static
 * <MealComponent mealId="123" isFullScreen={true} />
 */
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
    priority = false,
    className,
    ...props
}) => {
    const {user, isAuthenticated} = useAuth();
    const [isCard, setIsCard] = React.useState(isCardInit);
    const [meal, setMeal] = React.useState<Meal | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const mealRef = React.useRef<HTMLDivElement>(null);

    // Fetch meal data when authenticated and mealId changes
    useEffect(() => {
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

        if (mealId && isAuthenticated && user) {
            fetchMeal();
        }
    }, [mealId, isAuthenticated, user]);

    // Trigger card-to-modal animation on mount (unless fullscreen)
    useEffect(() => {
        if (isFullScreen) return;

        setIsCard(true); // Initial state (collapsed card)
        requestAnimationFrame(() => {
            setIsCard(false); // Start transition to expanded modal after paint
        });
    }, [isFullScreen]);

    // Handle close trigger to animate back to card state
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
                // Apply card dimensions or centered modal positioning based on state
                ...(!isFullScreen && (isCard ? {top, left, height, maxWidth: width} : {top: "50%", left: "50%"})),
                scrollbarWidth: "none",
                // Apply rounded corners in card state if provided
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
                {/* 
                  Desktop layout (xl breakpoint):
                  - Left column: Cover image + instructions
                  - Right sidebar: Ingredients + ratings
                  
                  Mobile/Tablet: Stacked with tabs for instructions/ingredients
                */}
                <div
                    className={`flex flex-col xl:flex-row xl:h-full gap-5 transition-[padding,width] duration-1000 ${isCard ? "p-0 w-full" : "p-2 sm:p-5 xl:w-[calc(100%-26.25rem)]"}`}>
                    {/* Main content column */}
                    <div
                        className={`flex flex-col gap-5 h-full shrink-0  transition-[width] w-full duration-1000`}>
                        <MealCoverImage

                            meal={meal}
                            loading={isLoading}
                            description={meal?.description || ""}
                            loadingImage={loadingImage}
                            isFullScreen={isFullScreen}
                            isCard={isCard}
                            priority={priority}
                            onClick={e => e.stopPropagation()}
                        />
                        {/* Instructions visible on desktop only */}
                        <InstructionsCard meal={meal} loading={isLoading} className="hidden md:flex "/>
                    </div>

                    {/* Right sidebar: ingredients and ratings (desktop only) */}
                    <div className={`hidden md:flex flex-row-reverse xl:flex-col gap-5 xl:w-100`}>
                        <RatingCard mealId={mealId}
                                    className="hidden lg:flex overflow-hidden max-h-[max(calc(100vh-100px),500px)] transition-[width, padding]"/>
                        <IngredientsCard meal={meal} loading={isLoading} className="overflow-hidden max-h-[max(calc(100vh-100px),500px)]"/>
                    </div>

                    {/* Mobile tabs for instructions and ingredients */}
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