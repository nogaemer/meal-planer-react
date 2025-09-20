import React from "react";
import type {Meal} from "@/types/meal.ts";
import {Clock4, Share} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {cn} from "@/lib/utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

interface MealCoverImageProps {
    meal: Meal | null;
    description: string;
    loadingImage: string;
    loading: boolean;
    isCard: boolean;
}

export const MealCoverImage: React.FC<MealCoverImageProps & React.HTMLAttributes<HTMLDivElement>> = ({
    meal,
    description,
    loadingImage,
    loading,
    isCard,
    ...props
}) => {

    // if (!meal || loading) return <MealCoverImageSkeleton loadingImage={loadingImage} isCard={isCard} {...props} />

    return (
        <div
            className={`w-full relative overflow-hidden transition-[border-radius] duration-1000 ${isCard ? "rounded-none" : "rounded-4xl"}`} {...props}>
            <Carousel className="w-full h-full" opts={{loop: true, active: !isCard}}>
                <CarouselContent>
                    {(!meal || loading) ?
                    <CarouselItem key={"0"} className={`flex items-center overflow-hidden transition-[border-radius] duration-1000 ${isCard ? "rounded-2xl" : "rounded-4xl"}`}>
                        <img
                            src={loadingImage || "src/assets/meal-placeholder.png"}
                            alt={"Cover Image"}
                            className="w-full h-full object-cover m-auto flex "
                        />
                    </CarouselItem>
                    :
                    meal.images.map((imageInfo, index) => {

                        const image = imageInfo.srcSetArray ? imageInfo.srcSetArray[0] : imageInfo.thumbnail;
                        return (
                            <CarouselItem key={index}
                                          className={`flex items-center overflow-hidden transition-[border-radius] duration-1000 ${isCard ? "rounded-2xl" : "rounded-4xl"}`}>
                                <img
                                    src={image.replace("360x240", "1200x675") || "src/assets/meal-placeholder.png"}
                                    alt={meal.name}
                                    className="w-full h-full object-cover m-auto flex "
                                />
                            </CarouselItem>
                        )
                    })}

                </CarouselContent>

                <CarouselPrevious className={`left-5 transition-opacity duration-250 delay-250  
                ${isCard ? "pointer-events-none disabled:opacity-0 opacity-0" : "opacity-100 disabled:opacity-100"}`}/>

                <CarouselNext className={`right-5 transition-opacity duration-250 delay-250  
                ${isCard ? "pointer-events-none disabled:opacity-0 opacity-0" : "opacity-100 disabled:opacity-100"}`}/>
            </Carousel>

            <div
                className={`absolute flex bottom-5 left-5 px-5 py-4 max-w-xs flex-col items-start gap-3 rounded-2xl 
                border backdrop-blur-sm bg-background/80 transition-opacity duration-250 delay-250  ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                {(!meal || loading) ?
                    <>
                        <Skeleton className="w-40 h-8 rounded" />
                        <Skeleton className="w-60 h-5 rounded" />
                        <Skeleton className="w-60 h-5 rounded" />
                    </>
                    :
                    <>
                        <h1 className="text-secondary-foreground text-2xl">{meal.name}</h1>
                        <p className="text-muted-foreground text-md ">{description}</p>
                    </>}
            </div>

            <MealInfo difficulty={meal?.difficulty} time={meal?.time} loading={(!meal || loading)}
                      className={`transition-opacity duration-250 delay-250 ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}/>

            <Button variant="empty"
                    className={`absolute flex top-5 right-0 mr-5 justify-center items-center size-12 rounded-2xl 
                    border backdrop-blur-sm bg-background/80 transition-opacity duration-250 delay-250 ${isCard ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                <Share className="size-6"/>
            </Button>
        </div>
    )
}

interface MealInfoProps {
    difficulty?: string;
    time?: number;
    loading: boolean;
}

const MealInfo: React.FC<MealInfoProps & React.HTMLAttributes<HTMLDivElement>> = ({
    difficulty,
    time,
    loading,
    className,
    ...props
}) => (
    <div className={cn("absolute flex gap-3 bottom-5 right-0 mr-5", className)} {...props}>
        <div className="flex px-3 items-center gap-3 p-3 rounded-3xl border backdrop-blur-sm bg-background/80">
            <div className="flex items-center justify-center size-12 bg-accent rounded-2xl">
                <Clock4 className="text-accent-foreground size-8"/>
            </div>
            <div className="flex flex-col gap-1">
                {(loading) ?
                    <>
                        <Skeleton className="w-20 h-5 rounded" />
                        <Skeleton className="w-20 h-5 rounded" />
                    </>
                    :
                    <>
                        <span className="text-muted-foreground text-xs font-normal ">Schwierigkeitsgrad</span>
                        <span className="text-foreground text-xs font-medium">{difficulty}</span>
                    </>}
            </div>
        </div>

        <div className="flex px-3 items-center gap-3 p-3 rounded-3xl border backdrop-blur-sm bg-background/80">
            <div className="flex items-center justify-center size-12 bg-accent rounded-2xl">
                <Clock4 className="text-accent-foreground size-8"/>
            </div>
            <div className="flex flex-col gap-1">
                {(loading || !time) ?
                <>
                    <Skeleton className="w-20 h-5 rounded" />
                    <Skeleton className="w-20 h-5 rounded" />
                </>
                :
                <>
                    <span className="text-muted-foreground text-xs font-normal ">Zubereitungszeit</span>
                    <span className="text-foreground text-xs font-medium">{formatMinutes(time as number)}</span>
                </>}
            </div>
        </div>
    </div>
);

function formatMinutes(minutes: number): string {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    return parts.length > 0 ? parts.join(' ') : '0m';
}

