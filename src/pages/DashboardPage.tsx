import React, {useEffect, useRef, useState} from "react";
import {MealPage} from "@/pages/MealPage.tsx";
import type {Meal} from "@/types/meal.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {httpClient} from "@/services/httpClient.ts";

const DashboardPage: React.FC = () => {
    const {user, isAuthenticated} = useAuth();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [fakeMeal, setFakeMeal] = useState<{
        index: number;
        mealId: string;
        image: string;
        top: number;
        left: number;
        width: number;
        height: number;
    } | null>(null);

    // Store refs for each MealPage
    const mealRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleMealClick = (index: number, mealId: string) => {
        if (isClosing) return;

        const node = mealRefs.current[index];
        if (node) {
            const rect = node.getBoundingClientRect();
            const meal = meals[index];
            const image = meal.images[0].srcSetArray ? meal.images[0].srcSetArray[0] : meal.images[0].thumbnail;

            setFakeMeal({
                index,
                mealId,
                image: image.replace("360x240", "1200x675") || "src/assets/meal-placeholder.png",
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        }
        setTimeout(() => {
            mealRefs.current[index]!.style.opacity = "0";
        }, 50);
    };

    useEffect(() => {
        if (!fakeMeal) return;
        if (loading) return;

        setShowBackdrop(false)
        requestAnimationFrame(() => {
            setShowBackdrop(true)
        });
    }, [fakeMeal]);

    const closeFakeMeal = () => {
        if (isClosing) return;
        setIsClosing(true);
        setShowBackdrop(false);

        setTimeout(() => {
            if (fakeMeal && mealRefs.current[fakeMeal.index]) {
                mealRefs.current[fakeMeal.index]!.style.opacity = "1";
            }
            setFakeMeal(null);
            setIsClosing(false);
        }, 1000);
    }

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchMeals();
        }
    }, [user, isAuthenticated]);

    const fetchMeals = async (): Promise<void> => {
        setLoading(true);
        try {
            const data = await httpClient.get<Meal[]>(`/api/v1/meals`)
            setMeals(data);
        } catch (error) {
            console.error('Failed to fetch meals:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex w-full min-h-screen p-5">
            <div className="h-full w-64 shrink-0"></div>
            <div className="flex flex-wrap gap-5">
                {meals.map((meal, idx) => {
                    const image = meal.images[0].srcSetArray ? meal.images[0].srcSetArray[0] : meal.images[0].thumbnail;

                    return(
                    <div
                        key={idx}
                        ref={el => {
                            mealRefs.current[idx] = el
                        }}
                        onClick={() => handleMealClick(idx, meal.id)}
                        className="w-80 h-40 rounded-2xl overflow-hidden cursor-pointer"
                    >
                        <img
                            src={image.replace("360x240", "1200x675") || "src/assets/meal-placeholder.png"}
                            alt={meal.name}
                            className="object-cover m-auto flex"
                        />
                    </div>
                )})}
                {fakeMeal && (
                    <>
                        <div
                            className={`fixed top-0 left-0 w-screen h-screen z-999 transition-[backdrop-filter,background-color] duration-300 ${showBackdrop ? "bg-[rgba(0,0,0,0.5)] backdrop-blur-md" : "bg-transparent backdrop-blur-none"}`}
                            onClick={e => {
                                if (e.target === e.currentTarget) closeFakeMeal();
                            }}
                        >
                            <MealPage
                                mealId={fakeMeal.mealId}
                                loadingImage={fakeMeal.image}
                                fake
                                top={fakeMeal.top}
                                left={fakeMeal.left}
                                shouldClose={!showBackdrop}
                            />

                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default DashboardPage;
