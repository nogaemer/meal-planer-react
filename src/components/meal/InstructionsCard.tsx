/**
 * Step-by-step cooking instructions card component with numbered steps
 */
import React, {type JSX} from "react";
import {Card} from "@/components/ui/card.tsx";
import {List} from "@/components/ui/list.tsx";
import {cn} from "@/lib/utils.ts";
import InstructionsNumberBgOval from "@/assets/react/InstructionsNumberBgOval.tsx";
import type {Meal} from "@/types/meal.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

interface InstructionComponentProps {
    meal: Meal | null;
    loading: boolean;
}

/**
 * InstructionCard - Displays numbered cooking instructions
 *
 * Shows step-by-step cooking instructions with visual numbered badges.
 * Each step includes an oval-shaped number indicator and instruction text.
 *
 * @param {Meal|null} meal - Meal object containing instructions array
 * @param {boolean} loading - Whether to display loading skeleton
 *
 * @returns {JSX.Element} Card with numbered instruction steps
 */
const InstructionCard: React.FC<InstructionComponentProps & React.HTMLProps<HTMLDivElement>> = ({
                                                                                                    meal,
                                                                                                    loading,
                                                                                                    className,
                                                                                                    ...props
                                                                                                }) => {

    return (
        <Card className={cn("py-5 px-5 pt-8 rounded-3xl", className)} {...props}>
            <p className="text-foreground font-inter text-xl font-medium leading-none">
                Zubereitung
            </p>
            {(loading || !meal) ? (<InstructionListSkeleton/>) : (<InstructionList instructions={meal.instructions}/>)}
        </Card>
    )
};

/**
 * InstructionListSkeleton - Loading placeholder for instruction steps
 * Displays 5 skeleton steps with numbered ovals and text placeholders
 */
const InstructionListSkeleton: React.FC = () => (
    <List className="flex flex-col gap-8">

        {Array.from({length: 5}).map((_, idx) => (
            <div className="flex w-full gap-4" key={idx}>
                {/* Numbered oval badge */}
                <div className="relative shrink-0 h-16 w-16 justify-center">
                    <InstructionsNumberBgOval/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-accent-foreground font-semibold text-4xl">{idx + 1}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="w-full h-5 rounded-md"/>
                    <Skeleton className="w-full h-5 rounded-md"/>
                    <Skeleton className="w-1/4 h-5 rounded-md"/>
                </div>
            </div>
        ))}
    </List>
);


interface InstructionListProps {
    instructions: string[];
}

/**
 * InstructionList - Renders numbered instruction steps
 *
 * Each step displays:
 * - Numbered oval badge (responsive sizing)
 * - Instruction text
 *
 * @param {InstructionListProps} props - Component props
 * @param {string[]} prop.instructions - Array of instruction text strings
 * @returns {JSX.Element} List of numbered instruction steps
 */
const InstructionList: React.FC<InstructionListProps> = ({instructions}:InstructionListProps): JSX.Element => (
    <List className="flex flex-col gap-8">

        {instructions?.map((Instruction, idx) => {

            return (
                <div className="flex w-full gap-3" key={idx}>
                    {/* Responsive numbered oval badge */}
                    <div className="relative shrink-0 sm:w-16 sm:h-16 w-12 h-12 items-center justify-center float-left">
                        <InstructionsNumberBgOval className="sm:w-16 sm:h-16 w-12 h-12"/>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-accent-foreground font-semibold sm:text-4xl text-2xl">{idx + 1}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground">{Instruction}</p>
                </div>
            );
        })}
    </List>
);

export default InstructionCard;