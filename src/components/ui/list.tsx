import * as React from "react"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"


function ListShape({
    className,
    shape = "pill",
    children,
    ...props
}: React.ComponentProps<"div">
    & { shape?: "pill" | "star" }) {

    switch (shape) {
        case "pill":
            return (
                <div
                    data-slot="list-shape"
                    className={cn("px-5 pt-0.5 bg-[#7e92be] flex flex-row items-center h-7", className)}
                    style={{
                        mask: "url(\"src/assets/list-shape-exclude.svg\") -1px/contain no-repeat, url(\"src/assets/list-shape-exclude-flipped.svg\") calc(100% + 1px)/contain no-repeat, linear-gradient(#000 0 0)",
                        maskComposite: "exclude",
                    }}
                    {...props}
                >
                    {children}
                </div>
            )
        case "star":
            return (
                <div
                    data-slot="list-shape"
                    className={cn("p-0 pt-0.5 flex flex-row items-center justify-center relative h-10 w-10", className)}
                    {...props}
                >
                    <img
                        src="/src/assets/list-shape-star.svg"
                        alt="List shape icon"
                        className="absolute block inset-0 m-auto"
                    />
                    <div className="relative z-10 w-full flex justify-center items-center pt-1">
                        {children}
                    </div>
                </div>
            )
    }
}

const listTextVariants = cva(
    "text-xs font-medium",
    {
        variants: {
            color: {
                green: "text-accent-foreground",
                white: "text-white inline-block w-fit -mt-0.5",
            }
        },
        defaultVariants: {
            color: "green",
        },
    }
)

function ListText({
    className,
    color,
    ...props
}: React.ComponentProps<"span">
    & VariantProps<typeof listTextVariants>) {
    return (
        <span
            data-slot="list-text"
            className={cn(listTextVariants({color, className}))}
            {...props}
        />
    )
}

const listItemVariants = cva(
    "px-4 py-3.5 justify-between items-center flex bg-accent h-14",
    {
        variants: {
            round: {
                top: "rounded-t-2xl rounded-b-sm",
                all: "rounded-2xl",
                none: "rounded-sm",
                bottom: "rounded-b-2xl rounded-t-sm",
            }
        },
        defaultVariants: {
            round: "all",
        },
    }
)

function ListItems({
    className,
    round,
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof listItemVariants>) {
    return (
        <div
            data-slot="list-item"
            className={cn(listItemVariants({round, className}))}
            {...props}
        />
    )
}

function List({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "flex flex-col gap-0.5 overflow-y-scroll overflow-x-hidden rounded-2xl",
                className
            )}
            {...props}
        />
    )
}

export {List, ListItems, ListText, ListShape}
