/**
 * Compact meal card component displaying meal summary with image, title, rating, and prep time
 */
import React from 'react';
import { Link } from "react-router-dom";
import {formatMinutes} from "@/utils/time.ts";
import ListShapeStar from "@/assets/react/ListShapeStar.tsx";
import {Clock4} from "lucide-react";

type MealCardProps = {
    mealId: string;
    title: string;
    description: string;
    imageUrl: string;
    rating: number;
    prepTime: number;
    imgRef: (el: HTMLDivElement | null) => void;
    handleImageClick: () => void;
    priority?: boolean;
};

/**
 * MealCard - Compact card displaying meal information in grid/list views
 * 
 * @param {string} mealId - Unique meal identifier for navigation
 * @param {string} title - Meal name displayed as heading
 * @param {string} description - Brief meal description (single line truncated)
 * @param {string} imageUrl - URL for meal cover image
 * @param {number} rating - Average meal rating (displayed with 1 decimal)
 * @param {number} prepTime - Preparation time in minutes
 * @param {Function} imgRef - Callback ref for image element (lazy loading)
 * @param {Function} handleImageClick - Handler for card/image click events
 * @param {boolean} [priority=false] - Whether to load image with high priority (for above-fold cards)
 * 
 * @returns {JSX.Element} Clickable meal card with image, title, description, and metadata
 */
const MealCard: React.FC<MealCardProps> = ({
    mealId,
    title,
    description,
    imageUrl,
    rating,
    prepTime,
    imgRef,
    handleImageClick,
    priority = false
}) => (
    <div className="w-full max-w-md mx-auto h-fit bg-card rounded-3xl overflow-hidden shadow-md flex flex-col"
         onClick={handleImageClick}>
        {/* Meal cover image with lazy loading support */}
        {imageUrl && <img src={imageUrl} alt={title} className="h-40 object-cover cursor-pointer" ref={imgRef} fetchPriority={priority ? "high" : "auto"} loading={priority ? "eager" : "lazy"}/>}

        <div className="flex flex-col px-5 py-4">
            {/* Title and description section */}
            <div className="flex flex-col">
                <Link to={`/meal/${mealId}`} onClick={(e) => e.stopPropagation()}>
                    <h2 className="line-clamp-2 overflow-hidden text-ellipsis text-lg cursor-pointer">{title}</h2>
                </Link>
                <p className="line-clamp-1 overflow-hidden text-ellipsis text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Metadata grid: rating and prep time */}
            <div className="gap-[2px] grid grid-cols-2 grid-rows-1 relative w-full mt-4">

                <MealCardInfo
                    label="Bewertung"
                    value={rating.toFixed(1)}
                    icon={
                        <ListShapeStar className="fill-accent-foreground size-6"/>
                    }
                />

                <MealCardInfo
                    label="Zubereitungszeit"
                    value={formatMinutes(prepTime as number)}
                    icon={
                        <Clock4 className="text-accent-foreground size-6"/>
                    }
                />

            </div>

        </div>
    </div>
);

type MealCardInfoProps = {
    label: string;
    value: string | number;
    iconWrapperClass?: string;
    icon: React.ReactNode;
};

/**
 * MealCardInfo - Reusable info display component with icon, label, and value
 * Used to display rating, prep time, and other metadata in consistent format
 * 
 * @param {string} label - Descriptive label text
 * @param {string|number} value - Display value (rating score, time, etc.)
 * @param {string} [iconWrapperClass=""] - Optional CSS classes for icon wrapper
 * @param {React.ReactNode} icon - Icon component to display
 * 
 * @returns {JSX.Element} Info block with icon, label, and value
 */
const MealCardInfo: React.FC<MealCardInfoProps> = ({
    label,
    value,
    iconWrapperClass = "",
    icon
}) => (
    <div className="flex gap-2 items-center overflow-clip relative">
        <div className={`flex p-2 justify-center items-center bg-accent rounded-xl`}>
            <div className={iconWrapperClass}>
                {icon}
            </div>
        </div>
        <div className="flex flex-col gap-[2px] items-start text-[12px]">
            <p className="font-normal text-muted-foreground line-clamp-1 overflow-hidden text-ellipsis">{label}</p>
            <p className="font-medium text-foreground line-clamp-1 overflow-hidden text-ellipsis">{value}</p>
        </div>
    </div>
);

export default MealCard;