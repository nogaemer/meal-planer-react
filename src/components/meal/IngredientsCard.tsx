/**
 * Ingredients card component with dynamic portion scaling and fraction/decimal conversion
 */
import React, {useEffect, useState} from "react";
import {Card} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Minus, Plus} from "lucide-react";
import {List, ListItems, ListShape, ListText} from "@/components/ui/list.tsx";
import {cn} from "@/lib/utils.ts";
import type {MealIngredient, Meal} from "@/types/meal.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

// --- Fraction/Decimal conversion utilities ---
// Maps Unicode fraction characters to decimal equivalents
const unicodeFractions: Record<string, number> = {
    "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
    "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8, "⅙": 1 / 6, "⅚": 5 / 6,
    "⅐": 1 / 7, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
    "⅑": 1 / 9, "⅒": 0.1,
};
// Maps decimal values to Unicode fraction characters for display
const decimalFractions: Record<number, string> = {
    0.5: "½", 0.33: "⅓", 0.67: "⅔", 0.25: "¼", 0.75: "¾",
    0.2: "⅕", 0.4: "⅖", 0.6: "⅗", 0.8: "⅘", 0.17: "⅙", 0.83: "⅚",
    0.14: "⅐", 0.13: "⅛", 0.38: "⅜", 0.63: "⅝", 0.88: "⅞",
    0.11: "⅑", 0.1: "⅒",
};

/**
 * Converts Unicode fraction characters or fraction strings to decimal numbers
 * @param {string|number} fraction - Fraction character (e.g., "½") or numeric string
 * @returns {number|string} Decimal number or original string if not convertible
 */
function convertFractionToDecimal(fraction: string | number): number | string {
    if (typeof fraction === "number") return fraction;
    if (Object.prototype.hasOwnProperty.call(unicodeFractions, fraction)) return unicodeFractions[fraction];
    if (!isNaN(Number(fraction))) return parseFloat(fraction);
    return fraction;
}

/**
 * Converts decimal numbers to Unicode fraction format when possible
 * Handles mixed numbers (e.g., 1.5 → "1 ½")
 * @param {number} decimal - Decimal number to convert
 * @returns {string|number} Fraction string or original decimal if no match found
 */
function convertDecimalToFraction(decimal: number): string | number {
    const integerPart = Math.floor(decimal);
    const decimalPart = Number((decimal - integerPart).toFixed(2));
    if (Object.prototype.hasOwnProperty.call(decimalFractions, decimalPart)) {
        return (integerPart !== 0 ? integerPart + " " : "") + decimalFractions[decimalPart];
    }
    return decimal;
}

/**
 * Intelligently rounds numbers based on magnitude for clean display
 * - Converts to fraction if possible (e.g., 0.5 → ½)
 * - Adjusts decimal places based on integer digits (fewer decimals for larger numbers)
 * - Ensures reasonable precision without excessive digits
 * 
 * @param {number} num - Number to round
 * @returns {number} Rounded number with appropriate decimal places
 */
function roundToTwoDecimalPlaces(num: number): number {
    const integerDigits = Math.floor(num).toString().length;
    let decimalPlaces: number;
    if (convertDecimalToFraction(num) !== num && integerDigits < 3) {
        decimalPlaces = 2;
    } else {
        switch (integerDigits) {
            case 0:
                decimalPlaces = 3;
                break;
            case 1:
                decimalPlaces = 2;
                break;
            case 2:
                decimalPlaces = 1;
                break;
            case 3:
                decimalPlaces = 0;
                break;
            default:
                decimalPlaces = 0;
        }
    }
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(num * multiplier) / multiplier;
}

// --- Main Component ---
interface IngredientsComponentProps {
    meal: Meal | null;
    loading: boolean;
}

/**
 * IngredientsCard - Interactive ingredients list with portion scaling
 * 
 * Displays meal ingredients with the ability to adjust serving size.
 * Automatically recalculates ingredient amounts based on portion changes,
 * maintaining appropriate precision and fraction display.
 * 
 * Features:
 * - Dynamic portion adjustment (+/- buttons)
 * - Automatic ingredient amount scaling
 * - Fraction/decimal conversion for readable measurements
 * - Skeleton loading state
 * 
 * @param {Meal|null} meal - Meal object containing ingredients and portion info
 * @param {boolean} loading - Whether to display loading skeleton
 * 
 * @returns {JSX.Element} Card with adjustable ingredient list
 */
const IngredientsCard: React.FC<IngredientsComponentProps & React.HTMLAttributes<HTMLDivElement>> = ({
    meal,
    loading,
    className,
    ...props
}) => {
    const [wantedPortions, setWantedPortions] = useState<number>(meal?.portions ?? 1);

    // Sync portion count with meal data when meal changes
    useEffect(() => {
        setWantedPortions(meal?.portions ?? 1);
    }, [meal]);

    // Recalculate ingredient amounts based on desired portions
    const updatedIngredients = meal?.ingredients.map(ingredient => {
        const amount = convertFractionToDecimal(ingredient.amount);
        let displayAmount = ingredient.amount;
        // Scale ingredient amount proportionally to portion change
        if (
            wantedPortions !== 0 &&
            wantedPortions &&
            amount &&
            typeof amount !== "string"
        ) {
            // Calculate: (original amount / original portions) * desired portions
            const calculatedAmount = roundToTwoDecimalPlaces(
                (amount as number) / meal.portions * wantedPortions
            );
            displayAmount = String(convertDecimalToFraction(calculatedAmount));
        }
        return {...ingredient, amount: displayAmount};
    }) ?? [];

    return (
        <div className="pb-5 overflow-hidden w-full xl:shrink-0 xl:w-100">
            <Card className={cn("py-5 px-5 pt-10 mb-5 rounded-4xl", className)} {...props}>
                <p className="text-foreground font-inter text-2xl font-medium leading-none">
                    Zutaten
                </p>
                <Separator/>
                {(loading || !meal) ? <IngredientsCardSkeleton/> :
                    <>
                        {/* Portion control header with +/- buttons */}
                        <div className="flex justify-between items-center">
                            <ListText>{wantedPortions} Portion{wantedPortions > 1 ? "en" : ""}</ListText>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 text-accent-foreground shadow-none"
                                    onClick={() => setWantedPortions(Math.max(1, wantedPortions - 1))}
                                    aria-label="Decrease portions"
                                >
                                    <Minus/>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8 text-accent-foreground shadow-none"
                                    onClick={() => setWantedPortions(wantedPortions + 1)}
                                    aria-label="Increase portions"
                                >
                                    <Plus/>
                                </Button>
                            </div>
                        </div>
                        <Separator/>
                        <IngredientList ingredients={updatedIngredients}/>
                    </>}
            </Card>
        </div>
    );
};

/**
 * IngredientsCardSkeleton - Loading placeholder for ingredients card
 * Displays portion controls and 4 ingredient placeholders
 */
const IngredientsCardSkeleton = () => (
    <>
        <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-5 rounded-md"/>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-accent-foreground shadow-none"
                    aria-label="Decrease portions"
                >
                    <Minus/>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-accent-foreground shadow-none"
                    aria-label="Increase portions"
                >
                    <Plus/>
                </Button>
            </div>
        </div>
        <Separator/>
        <List>
            <Skeleton className="min-h-14 rounded-b-md rounded-t-2xl"/>
            <Skeleton className="min-h-14 rounded-md"/>
            <Skeleton className="min-h-14 rounded-md"/>
            <Skeleton className="min-h-14 rounded-t-md rounded-b-2xl"/>
        </List>
    </>
)


interface IngredientListProps {
    ingredients: MealIngredient[];
}

/**
 * IngredientList - Renders list of ingredients with amounts and units
 * 
 * Each ingredient displays:
 * - Ingredient name
 * - Amount and unit in a pill-shaped badge
 * 
 * Applies appropriate border radius to first/last/single items
 * 
 * @param {MealIngredient[]} ingredients - Array of scaled ingredient objects
 * @returns {JSX.Element} Styled list of ingredient items
 */
const IngredientList: React.FC<IngredientListProps> = ({ingredients}) => (
    <List>
        {ingredients?.map((ingredient, idx, arr) => {
            // Determine border radius based on position in list
            let round: "top" | "none" | "all" | "bottom";
            if (arr.length === 1) round = "all";
            else if (idx === 0) round = "top";
            else if (idx === arr.length - 1) round = "bottom";
            else round = "none";

            return (
                <ListItems key={ingredient.ingredient.name ?? idx} round={round} className="shrink-0">
                    <ListText>{ingredient.ingredient.name}</ListText>
                    {(ingredient.amount || ingredient.unit) && (
                        <ListShape shape="pill">
                            <ListText color="white">{ingredient.amount}</ListText>
                            {(ingredient.amount && ingredient.unit.abbreviation) && <p>{'\u00A0'}</p>}
                            <ListText color="white">{ingredient.unit.fullName}</ListText>
                        </ListShape>
                    )}
                </ListItems>
            );
        })}
    </List>
);

export default IngredientsCard;
