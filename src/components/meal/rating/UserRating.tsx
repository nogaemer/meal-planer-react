import React, {useState} from "react";
import {ListItems, ListShape, ListText} from "@/components/ui/list.tsx";
import {Badge} from "../../ui/badge.tsx";

interface UserRatingProps {
    user: { id?: string; name?: string };
    userRating: number;
    existingRatingId: string | null;
    onSubmit: (rating: number) => void;
    round: "top" | "all" | "none" | "bottom";
}

const UserRating: React.FC<UserRatingProps> = ({user, userRating, existingRatingId, onSubmit, round}) => {
    const [hovered, setHovered] = useState(!existingRatingId);

    return (
        <ListItems
            key={user?.id}
            round={round}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative overflow-hidden px-0 min-h-14"
        >
            {/* Username and rating, fade out on hover */}
            <div
                className={`justify-between items-center flex px-4 absolute transition-[transform, translate] duration-300 w-full
                ${hovered || !existingRatingId ? "opacity-0 -translate-y-5 pointer-events-none" : "opacity-100 translate-y-0 pointer-events-auto"}`}
            >
                <Badge variant="outline" className="border-accent-foreground text-accent-foreground">{user.name}</Badge>
                <ListShape shape="star">
                    <ListText color="white">{userRating}</ListText>
                </ListShape>
            </div>

            {/* Stars, fade in on hover */}
            <div
                className={`justify-between items-center flex px-4 w-full z-20 transition-[transform, translate] duration-300 
                ${hovered || !existingRatingId ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-5 pointer-events-none"}`}
            >
                {[1, 2, 3, 4, 5].map((val) => (
                    <ListShape
                        key={val}
                        shape="star"
                        className={`cursor-pointer`}
                        classNameShape={`${val === userRating ? "fill-secondary-foreground" : ""}`}
                        onClick={() => onSubmit(val)}
                    >
                        <ListText color="white" className={`${val === userRating ? "text-secondary" : ""}`}>{val}</ListText>
                    </ListShape>
                ))}
            </div>
        </ListItems>
    );
};

export default UserRating;