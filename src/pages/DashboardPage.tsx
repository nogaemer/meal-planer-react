import React, {useEffect, useRef, useState} from "react";
import {MealComponent} from "@/components/meal/MealComponent.tsx";
import type {Meal} from "@/types/meal.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {httpClient} from "@/services/httpClient.ts";
import {useNavigate} from "react-router-dom";
import MealCard from "@/components/meal/MealCard.tsx";

const DashboardPage: React.FC = () => {
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();
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
        rounded: {
            borderTopLeftRadius: string;
            borderTopRightRadius: string;
            borderBottomLeftRadius: string;
            borderBottomRightRadius: string;
        }
    } | null>(null);

    // Store refs for each MealPage
    const mealRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleMealClick = (index: number, mealId: string) => {
        console.log("Meal clicked:", index, mealId);
        if (isClosing) return;

        if (window.matchMedia("(max-width: 96rem)").matches) {
            navigate(`/meal/${mealId}`)
            return;
        }

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
                rounded: {
                    borderTopLeftRadius: "24px",
                    borderTopRightRadius: "24px",
                    borderBottomLeftRadius: "0",
                    borderBottomRightRadius: "0",
                }
            });
        }
        window.history.pushState(null, "", `/meal/${mealId}`);
        setTimeout(() => {
            mealRefs.current[index]!.style.opacity = "0";
        }, 0);
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
            window.history.pushState(null, "", `/dashboard`);
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
        <div className="flex w-full min-h-screen pt-5 sm:pl-5 sm:pr-0 px-2 relative">
            <div className="h-[calc(100vh-40px)] hidden sm:flex w-64 shrink-0 bg-card rounded-2xl sticky top-5"></div>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,450px))] sm:grid-cols-[repeat(auto-fit,_minmax(330px,_1fr))] w-full sm:mx-12 gap-5 content-baseline">
                {meals.map((meal, idx) => {
                    const image = meal.images[0].srcSetArray ? meal.images[0].srcSetArray[0] : meal.images[0].thumbnail;

                    return (
                        // <div className="flex p-5 bg-accent rounded-2xl" key={meal.id}>
                        //     <div
                        //         key={idx}
                        //         ref={el => {
                        //             mealRefs.current[idx] = el
                        //         }}
                        //         onClick={() => handleMealClick(idx, meal.id)}
                        //         className="w-40 h-40 rounded-2xl overflow-hidden cursor-pointer"
                        //     >
                        //         <img
                        //             src={image.replace("360x240", "1200x675") || "src/assets/meal-placeholder.png"}
                        //             alt={meal.name}
                        //             className="object-cover m-auto flex w-full h-full"
                        //         />
                        //     </div>
                        // </div>
                        <MealCard mealId={meal.id} title={meal.name}
                                  description={"Hackbällchen in Tomatensauce mit Mozzarella überbacken"}
                                  imageUrl={image.replace("360x240", "1200x675") || "src/assets/meal-placeholder.png"}
                                  rating={meal.rating} prepTime={meal.time} key={idx}
                                  imgRef={el => {
                                      mealRefs.current[idx] = el
                                  }}
                                  handleImageClick={() => handleMealClick(idx, meal.id)}/>
                    )
                })}
                {fakeMeal && (
                    <>
                        <div
                            className={`fixed top-0 left-0 w-screen h-screen z-999 transition-[backdrop-filter,background-color] duration-300 ${showBackdrop ? "bg-[rgba(0,0,0,0.5)] backdrop-blur-md" : "bg-transparent backdrop-blur-none"}`}
                            onClick={e => {
                                if (e.target === e.currentTarget) closeFakeMeal();
                            }}
                        >
                            <MealComponent
                                mealId={fakeMeal.mealId}
                                loadingImage={fakeMeal.image}
                                top={fakeMeal.top}
                                left={fakeMeal.left}
                                width={fakeMeal.width}
                                height={fakeMeal.height}
                                rounded={fakeMeal.rounded}
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
