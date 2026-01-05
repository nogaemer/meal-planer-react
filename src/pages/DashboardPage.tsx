import React, {useEffect, useRef, useState} from "react";
import {MealComponent} from "@/components/meal/MealComponent.tsx";
import type {Meal, MealFilter} from "@/types/meal.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {httpClient} from "@/services/httpClient.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import MealCard from "@/components/meal/MealCard.tsx";
import {MealFilterSidebar} from "@/components/meal/MealFilterSidebar.tsx";

const DashboardPage: React.FC = () => {
    const {user, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<MealFilter>({
        limit: 20,
        skip: 0,
        sortBy: "INGREDIENT_MATCH"
    });
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
    }, [fakeMeal, loading]);

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

    const fetchMeals = React.useCallback(async (currentFilter: MealFilter) => {
        setLoading(true);
        try {
            // The user specified endpoint /api/v1/meals with POST data for filtering
            // and response format { results: Meal[] }
            const data = await httpClient.post<{results: Meal[]}>(`/api/v1/meals/search`, currentFilter);
            setMeals(data.results);
        } catch (error) {
            console.error('Failed to fetch meals:', error);
            // Fallback to GET if POST fails (in case the user was wrong about endpoint/method for initial load)
            // But for now, let's trust the user instructions.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchMeals(filter);
        }
    }, [user, isAuthenticated, filter, fetchMeals]);

    useEffect(() => {
        if (query !== null && query !== filter.name) {
            setFilter(prev => ({ ...prev, name: query }));
        }
    }, [filter.name, query]);

    const handleFilterChange = (newFilter: MealFilter) => {
        setFilter(newFilter);
    };

    return (
        <div className="flex w-full min-h-screen pt-5 sm:px-5 px-2 relative">
            <div className="hidden md:block w-80 mr-5 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
                <MealFilterSidebar onFilterChange={handleFilterChange} className="h-full rounded-lg border" />
            </div>
            <div className="flex-1">
                <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,450px))] sm:grid-cols-[repeat(auto-fit,_minmax(330px,_1fr))] w-full  gap-5 content-baseline">
                    {meals.map((meal, idx) => {
                        const image = meal.images[0].srcSetArray ? meal.images[0].srcSetArray[0] : meal.images[0].thumbnail;

                        return (
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
        </div>
    );
}

export default DashboardPage;
