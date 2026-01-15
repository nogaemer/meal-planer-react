/**
 * Hero section component with meal image carousel, metadata overlay, and action buttons
 */
import React from "react";
import type {Meal} from "@/types/meal.ts";
import {Clock4, Edit, Star} from "lucide-react";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {cn} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import RatingCard from "@/components/meal/rating/RatingCard.tsx";
import {Drawer, DrawerContent, DrawerTrigger} from "@/components/ui/drawer.tsx";
import {formatMinutes} from "@/utils/time.ts";
import {useNavigate} from "react-router-dom";

interface MealCoverImageProps {
    meal: Meal | null;
    description: string;
    loadingImage?: string;
    loading: boolean;
    isFullScreen: boolean;
    isCard: boolean;
    priority?: boolean;
}

/**
 * MealCoverImage - Hero section with image carousel and meal information overlay
 * 
 * Displays a responsive image carousel with meal photos, overlaid with:
 * - Meal name and description
 * - Difficulty and prep time badges
 * - Edit button and rating drawer
 * 
 * @param {Meal|null} meal - Full meal object with images, name, and metadata
 * @param {string} description - Meal description text for overlay
 * @param {string} [loadingImage] - Placeholder image URL during loading
 * @param {boolean} loading - Loading state for skeleton display
 * @param {boolean} isFullScreen - Whether component is in fullscreen mode
 * @param {boolean} isCard - Whether displayed as compact card (hides overlays)
 * @param {boolean} [priority=false] - Load first image with high priority
 * 
 * @returns {JSX.Element} Carousel hero section with meal images and interactive overlays
 */
export const MealCoverImage: React.FC<MealCoverImageProps & React.HTMLAttributes<HTMLDivElement>> = ({
    meal,
    description,
    loadingImage,
    loading,
    isFullScreen,
    isCard,
    priority = false,
    ...props
}) => {
    const navigate = useNavigate();

    const hasImages = !!meal && !loading && meal.images.length > 0;
    // Use high-res version of first image for hero display (1200x675 instead of 360x240)
    const heroSrc = loadingImage || (hasImages && (meal.images[0]?.srcSetArray?.at(0)?.replace("360x240", "1200x675") || meal.images[0]?.thumbnail.replace("360x240", "1200x675"))) || "";

    return (
        <div
            className={`max-h-full shrink-0 relative overflow-hidden transition-[border-radius,min-width,min-height,max-height] duration-1000 ${isCard ? "rounded-none min-w-full min-h-full" : "rounded-4xl min-w-0 min-h-0"}`} {...props}>
            {/* Image carousel with navigation controls */}
            <Carousel className="w-full h-full" opts={{active: !isCard, loop: true}}>
                <CarouselContent className="w-full h-full">

                    {/* First carousel item: hero image with optimized loading */}
                    <CarouselItem key={"0"}
                                  className={`flex items-center justify-center overflow-hidden transition-[border-radius] duration-1000 w-full h-full
                                  ${isCard ? "" : "lg:rounded-4xl"}`}>
                        {/* Conditional rendering based on fullscreen mode */}
                        {isFullScreen ?
                            <img
                                src={heroSrc}
                                alt={""}
                                className={`w-full h-full object-cover m-auto flex border-1 border-transparent ${!hasImages ? "animate-pulse bg-muted filter brightness-20" : ""}`}
                                fetchPriority={priority ? "high" : "auto"}
                                loading={priority ? "eager" : "lazy"}
                            />
                            :
                            <img
                                src={heroSrc}
                                alt={description}
                                className={`w-full h-full object-cover m-auto flex border-1 border-transparent ${!hasImages ? "animate-pulse bg-muted filter" : ""}`}
                                fetchPriority={priority ? "high" : "auto"}
                                loading={priority ? "eager" : "lazy"}
                            />
                        }
                    </CarouselItem>

                    {/* Additional meal images (beyond hero image) */}
                    {!(!meal || loading || meal.images.length === 0) && meal.images.slice(1).map((image, index) => (
                        <CarouselItem key={index}
                                      className={`flex items-center justify-center overflow-hidden transition-[border-radius] duration-1000 w-full h-full
                                      ${isCard ? "" : "lg:rounded-4xl"}`}>
                            <img
                                src={image?.srcSetArray?.at(0)?.replace("360x240", "1200x675") || image?.thumbnail.replace("360x240", "1200x675") || loadingImage}
                                alt={meal.name}
                                className="w-full h-full object-cover m-auto flex shrink-0"
                                onError={(e) => {
                                    e.currentTarget.src = loadingImage || "https://placehold.co/360x240/png";
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </CarouselItem>
                    ))}


                </CarouselContent>

                {/* Carousel navigation buttons (hidden in card mode) */}
                <CarouselPrevious className={`left-5 transition-opacity duration-250 delay-250  
                ${isCard ? "pointer-events-none disabled:opacity-0 opacity-0" : "opacity-100"}`}/>

                <CarouselNext className={`right-5 transition-opacity duration-250 delay-250
                ${isCard ? "pointer-events-none disabled:opacity-0 opacity-0" : "opacity-100"}`}/>

                {/* Difficulty and prep time info badges (desktop only, hidden in card mode) */}
                <MealInfo difficulty={meal?.difficulty} time={meal?.time} loading={(!meal || loading)}
                          className={`hidden sm:flex absolute transition-opacity duration-250 delay-250 ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}/>


                {/* Edit button (top-right corner, hidden in card mode) */}
                <a href={`/meal/${meal?.id}/edit`}
                   className={`absolute flex top-5 right-5 justify-center items-center size-10 rounded-2xl 
                    border backdrop-blur-sm bg-background/80 transition-opacity duration-250 delay-250 ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}
                   aria-label="Edit meal"
                   onClick={(e) => {
                       e.preventDefault();
                       navigate(`/meal/${meal?.id}/edit`);
                   }}>
                    <Edit className="size-6 text-accent-foreground"/>
                </a>


                {/* Rating drawer (mobile only, top-left corner, hidden in card mode) */}
                <Drawer>
                    <DrawerTrigger
                        className={`absolute flex lg:hidden top-5 left-5 mr-5 justify-center items-center size-10 rounded-2xl 
                    border backdrop-blur-sm bg-background/80 transition-opacity duration-250 delay-250 ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}
                        aria-label="Rate meal"
                    >
                        <Star className="size-6 text-accent-foreground"/>
                    </DrawerTrigger>
                    <DrawerContent className="bg-card mx-auto w-full max-w-md">
                        <RatingCard mealId={meal?.id || null}
                                    className="overflow-hidden max-h-[max(calc(100vh-100px),500px)] transition-[width, padding]"/>
                    </DrawerContent>
                </Drawer>
            </Carousel>

            {/* Meal title and description overlay (bottom-left, hidden in card mode) */}
            <div
                className={`lg:absolute flex bottom-5 left-5 px-6 lg:px-5 py-6 lg:py-4 lg:max-w-xs flex-col items-start gap-2 lg:rounded-2xl 
            lg:border backdrop-blur-sm bg-card lg:bg-background/80 transition-opacity duration-250 delay-250  ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                {/* Loading skeleton or meal title/description */}
                {(!meal || loading) ?
                    <>
                        <Skeleton className="w-40 h-8 rounded"/>
                        <Skeleton className="w-60 h-5 rounded"/>
                        <Skeleton className="w-60 h-5 rounded"/>
                    </>
                    :
                    <>
                        <h1 className="text-foreground text-2xl">{meal.name}</h1>
                        <p className="text-muted-foreground text-md ">{description}</p>
                        {/* Mobile-only compact metadata display */}
                        <MealInfo difficulty={meal?.difficulty} time={meal?.time} loading={(!meal || loading)} small
                                  className={`sm:hidden grid gap-x-0.5 gap-y-0.5 self-stretch grid-rows-1 grid-cols-2 mt-2 mr-0`}/>
                    </>}
            </div>
        </div>
    )
}

interface MealInfoProps {
    difficulty?: string;
    time?: number;
    loading: boolean;
    small?: boolean;
}

/**
 * MealInfo - Displays difficulty level and preparation time badges
 * 
 * Shows two info blocks:
 * 1. Difficulty indicator (3 horizontal bars, filled based on difficulty: easy/medium/hard)
 * 2. Preparation time with clock icon
 * 
 * @param {string} [difficulty] - Difficulty level: "easy", "medium", or "hard"
 * @param {number} [time] - Preparation time in minutes
 * @param {boolean} loading - Whether to show skeleton loading state
 * @param {boolean} [small] - Compact display mode (removes backdrop and border)
 * 
 * @returns {JSX.Element} Two-column info display with difficulty and time
 */
const MealInfo: React.FC<MealInfoProps & React.HTMLAttributes<HTMLDivElement>> = ({
    difficulty,
    time,
    loading,
    small,
    className,
    ...props
}) => (
    <div className={cn("flex gap-3 bottom-5 right-0 mr-5", className)} {...props}>
        {/* Difficulty indicator badge */}
        <div
            className={`flex items-center gap-2 ${small ? "" : "bg-background/80 backdrop-blur-sm rounded-3xl border p-3"}`}>
            {/* Three horizontal bars representing difficulty level (bottom bar always filled) */}
            <div className="flex shrink-0 items-center flex-col gap-1.5 justify-center size-10 bg-accent rounded-2xl">
                <div
                    className={`w-5 h-0.5 rounded ${difficulty === "hard" ? "bg-accent-foreground" : "bg-muted-foreground"}`}/>
                <div
                    className={`w-5 h-0.5 rounded ${difficulty !== "easy" ? "bg-accent-foreground" : "bg-muted-foreground"}`}/>
                <div className={`w-5 h-0.5 rounded bg-accent-foreground`}/>
            </div>
            <div className="flex flex-col gap-0.5 overflow-hidden">
                {(loading) ?
                    <>
                        <Skeleton className="w-20 h-5 rounded"/>
                        <Skeleton className="w-20 h-5 rounded"/>
                    </>
                    :
                    <>
                        <span className="text-muted-foreground text-xs font-normal truncate">Schwierigkeitsgrad</span>
                        <span className="text-foreground text-xs font-medium">{difficulty}</span>
                    </>}
            </div>
        </div>

        {/* Preparation time badge */}
        <div
            className={`flex px-3 items-center gap-2 ${small ? "" : "bg-background/80 backdrop-blur-sm rounded-3xl border p-3"}`}>
            <div className="flex shrink-0 items-center justify-center size-10 bg-accent rounded-2xl">
                <Clock4 className="text-accent-foreground size-6"/>
            </div>
            <div className="flex flex-col gap-0.5  overflow-hidden">
                {(loading || !time) ?
                    <>
                        <Skeleton className="w-20 h-5 rounded"/>
                        <Skeleton className="w-20 h-5 rounded"/>
                    </>
                    :
                    <>
                        <span className="text-muted-foreground text-xs font-normal truncate">Zubereitungszeit</span>
                        <span className="text-foreground text-xs font-medium">{formatMinutes(time as number)}</span>
                    </>}
            </div>
        </div>
    </div>
);

