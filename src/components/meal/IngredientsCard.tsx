import React, {useEffect, useState} from "react";
import {Card} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Minus, Plus} from "lucide-react";
import {List, ListItems, ListShape, ListText} from "@/components/ui/list.tsx";
import {cn} from "@/lib/utils.ts";
import type {Ingredient, Meal} from "@/types/meal.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

// --- Fraction/Decimal helpers ---
const unicodeFractions: Record<string, number> = {
    "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
    "⅕": 0.2, "⅖": 0.4, "⅗": 0.6, "⅘": 0.8, "⅙": 1 / 6, "⅚": 5 / 6,
    "⅐": 1 / 7, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
    "⅑": 1 / 9, "⅒": 0.1,
};
const decimalFractions: Record<number, string> = {
    0.5: "½", 0.33: "⅓", 0.67: "⅔", 0.25: "¼", 0.75: "¾",
    0.2: "⅕", 0.4: "⅖", 0.6: "⅗", 0.8: "⅘", 0.17: "⅙", 0.83: "⅚",
    0.14: "⅐", 0.13: "⅛", 0.38: "⅜", 0.63: "⅝", 0.88: "⅞",
    0.11: "⅑", 0.1: "⅒",
};

function convertFractionToDecimal(fraction: string | number): number | string {
    if (typeof fraction === "number") return fraction;
    if (Object.prototype.hasOwnProperty.call(unicodeFractions, fraction)) return unicodeFractions[fraction];
    if (!isNaN(Number(fraction))) return parseFloat(fraction);
    return fraction;
}

function convertDecimalToFraction(decimal: number): string | number {
    const integerPart = Math.floor(decimal);
    const decimalPart = Number((decimal - integerPart).toFixed(2));
    if (Object.prototype.hasOwnProperty.call(decimalFractions, decimalPart)) {
        return (integerPart !== 0 ? integerPart + " " : "") + decimalFractions[decimalPart];
    }
    return decimal;
}

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

// --- Main Card ---
interface IngredientsComponentProps {
    meal: Meal | null;
    loading: boolean;
}

const IngredientsCard: React.FC<IngredientsComponentProps & React.HTMLAttributes<HTMLDivElement>> = ({
    meal,
    loading,
    className,
    ...props
}) => {
    const [wantedPortions, setWantedPortions] = useState<number>(meal?.portions ?? 1);

    useEffect(() => {
        setWantedPortions(meal?.portions ?? 1);
    }, [meal]);

    // Calculate updated ingredients
    const updatedIngredients = meal?.ingredients.map(ingredient => {
        const amount = convertFractionToDecimal(ingredient.amount);
        let displayAmount = ingredient.amount;
        if (
            wantedPortions !== 0 &&
            wantedPortions &&
            amount &&
            typeof amount !== "string"
        ) {
            const calculatedAmount = roundToTwoDecimalPlaces(
                (amount as number) / meal.portions * wantedPortions
            );
            displayAmount = String(convertDecimalToFraction(calculatedAmount));
        }
        return {...ingredient, amount: displayAmount};
    }) ?? [];

    return (
        <Card className={cn("py-5 px-5 pt-10 rounded-4xl max-h-[calc(100vh-40px)]", className)} {...props}>
            <p className="text-secondary-foreground font-inter text-2xl font-medium leading-none">
                Zutaten
            </p>
            <Separator/>
            {(loading || !meal) ? <IngredientsCardSkeleton/> :
                <>
                    <div className="flex justify-between items-center">
                        <ListText>{wantedPortions} Portion{wantedPortions > 1 ? "en" : ""}</ListText>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8 text-accent-foreground shadow-none"
                                onClick={() => setWantedPortions(Math.max(1, wantedPortions - 1))}
                            >
                                <Minus/>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8 text-accent-foreground shadow-none"
                                onClick={() => setWantedPortions(wantedPortions + 1)}
                            >
                                <Plus/>
                            </Button>
                        </div>
                    </div>
                    <Separator/>
                    <IngredientList ingredients={updatedIngredients}/>
                </>}
        </Card>
    );
};

const IngredientsCardSkeleton = () => (
    <>
        <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-5 rounded-md"/>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-accent-foreground shadow-none"
                >
                    <Minus/>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-accent-foreground shadow-none"
                >
                    <Plus/>
                </Button>
            </div>
        </div>
        <Separator/>
        <List>
            {Array.from({length: 3}).map((_, idx, arr) => {
                let round: "top" | "none" | "all" | "bottom";
                if (arr.length === 1) round = "all";
                else if (idx === 0) round = "top";
                else if (idx === arr.length - 1) round = "bottom";
                else round = "none";

                return (
                    <ListItems key={idx} round={round} className="shrink-0">
                        <Skeleton className="w-20 h-5 rounded-md"/>
                        <ListShape shape="pill" className="animate-pulse w-15">
                        </ListShape>
                    </ListItems>
                )
            })}
        </List>
    </>
)


interface IngredientListProps {
    ingredients: Ingredient[];
}

const IngredientList: React.FC<IngredientListProps> = ({ingredients}) => (
    <List>
        {ingredients?.map((ingredient, idx, arr) => {
            let round: "top" | "none" | "all" | "bottom";
            if (arr.length === 1) round = "all";
            else if (idx === 0) round = "top";
            else if (idx === arr.length - 1) round = "bottom";
            else round = "none";

            return (
                <ListItems key={ingredient.name ?? idx} round={round} className="shrink-0">
                    <ListText>{ingredient.name}</ListText>
                    {(ingredient.amount || ingredient.unit) && (
                        <ListShape shape="pill">
                            <ListText color="white">{ingredient.amount}</ListText>
                            {(ingredient.amount && ingredient.unit) && <p>{'\u00A0'}</p>}
                            <ListText color="white">{ingredient.unit}</ListText>
                        </ListShape>
                    )}
                </ListItems>
            );
        })}
    </List>
);

export default IngredientsCard;
