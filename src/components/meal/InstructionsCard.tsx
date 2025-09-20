import React from "react";
import {Card} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {List} from "@/components/ui/list.tsx";
import {cn} from "@/lib/utils.ts";
import InstructionsNumberBgOval from "@/assets/react/InstructionsNumberBgOval.tsx";
import type {Meal} from "@/types/meal.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";

interface InstructionComponentProps {
    meal: Meal | null;
    loading: boolean;
}

const InstructionCard: React.FC<InstructionComponentProps & React.HTMLProps<HTMLDivElement>> = ({
    meal,
    loading,
    className,
    ...props
}) => {

    return (
        <Card className={cn("py-5 px-5 pt-10 rounded-4xl", className)} {...props}>
            <p className="text-secondary-foreground font-inter text-2xl font-medium leading-none">
                Zubereitung
            </p>
            <Separator/>
            {(loading || !meal) ? (<InstructionListSkeleton/>) : (<InstructionList instructions={meal.instructions} />)}
        </Card>
    )
};

const InstructionListSkeleton: React.FC = () => (
    <List className="flex flex-col gap-8">

        {Array.from({ length: 5 }).map((_, idx) => (
            <div className="flex w-full items-center gap-3" key={idx}>
                <div className="relative shrink-0 h-16 w-16 items-center justify-center">
                    {/*<img src="src/assets/instructions-number-bg-oval.svg" alt="oval background"/>*/}
                    <InstructionsNumberBgOval/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-accent-foreground font-semibold text-4xl">{idx + 1}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <Skeleton className="w-full h-5 rounded-md" />
                    <Skeleton className="w-full h-5 rounded-md" />
                    <Skeleton className="w-1/4 h-5 rounded-md" />
                </div>
            </div>
        ))}
    </List>
);


interface InstructionListProps {
    instructions: string[];
}

const InstructionList: React.FC<InstructionListProps> = ({instructions}) => (
    <List className="flex flex-col gap-8">

        {instructions?.map((Instruction, idx) => {

            return (
                <div className="flex w-full items-center gap-3" key={idx}>
                    <div className="relative shrink-0 h-16 w-16 items-center justify-center">
                        {/*<img src="src/assets/instructions-number-bg-oval.svg" alt="oval background"/>*/}
                        <InstructionsNumberBgOval/>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-accent-foreground font-semibold text-4xl">{idx + 1}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground">{Instruction}</p>
                </div>
            );
        })}
    </List>
);

export default InstructionCard;