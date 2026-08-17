/**
 * DashboardPage - Main meal discovery and browsing interface with filtering and modal view
 */

import React, {useEffect, useRef, useState} from "react";
import {MealComponent} from "@/components/meal/MealComponent.tsx";
import type {Meal, MealFilter} from "@/types/meal.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {httpClient} from "@/services/httpClient.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import MealCard from "@/components/meal/MealCard.tsx";
import {MealFilterSidebar} from "@/components/meal/MealFilterSidebar.tsx";
import {TodaysMealWidget} from "@/components/meal/today/TodaysMealWidget.tsx";
import {MarkMealDialog} from "@/components/meal/today/MarkMealDialog.tsx";
import {useDailyMealPlan} from "@/hooks/useDailyMealPlan.ts";

/**
 * DashboardPage component - Main browsing interface for meal discovery
 * 
 * Features:
 * - Grid layout of meal cards with filtering sidebar
 * - Animated modal view on desktop (>96rem) with backdrop
 * - Direct navigation on mobile
 * - Search query integration from URL params
 * - Lazy loading and pagination support
 * 
 * State management includes meal list, filters, modal animation state, and DOM refs
 * for smooth card-to-modal transitions.
 * 
 * @returns Dashboard with filterable meal grid and modal view
 */
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
        sortBy: "RELEVANCE",
        name: query || undefined,
    });
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    
    // Daily meal plan state
    const userId = user?.id || '';
    const { mealPlan, isLoading: planLoading, markMealForToday, clearMealPlan, completeMealPlan } = useDailyMealPlan(userId);
    const [showMarkDialog, setShowMarkDialog] = useState(false);
    // Modal animation state - stores position, dimensions, and styling for smooth card-to-modal transition
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

    // Store refs for each meal card to calculate positions for modal animation
    const mealRefs = useRef<(HTMLDivElement | null)[]>([]);

    /**
     * Handles meal card click - triggers modal animation on desktop or navigation on mobile
     * Captures card position and dimensions for smooth expansion animation
     */
    const handleMealClick = (index: number, mealId: string) => {
        console.log("Meal clicked:", index, mealId);
        if (isClosing) return;

        // On mobile/tablet, navigate directly without modal animation
        if (window.matchMedia("(max-width: 96rem)").matches) {
            navigate(`/meal/${mealId}`)
            return;
        }

        // Capture card's position and dimensions for modal animation
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
        // Hide original card to avoid visual duplication during animation
        setTimeout(() => {
            mealRefs.current[index]!.style.opacity = "0";
        }, 0);
    };

    // Trigger backdrop fade-in after modal is positioned
    useEffect(() => {
        if (!fakeMeal) return;
        if (loading) return;

        setShowBackdrop(false)
        requestAnimationFrame(() => {
            setShowBackdrop(true)
        });
    }, [fakeMeal, loading]);

    /**
     * Closes the modal with reverse animation back to card position
     * Restores card visibility and resets URL
     */
    const closeFakeMeal = () => {
        if (isClosing) return;
        setIsClosing(true);
        setShowBackdrop(false);

        // Wait for animation to complete, then restore card and clear modal state
        setTimeout(() => {
            if (fakeMeal && mealRefs.current[fakeMeal.index]) {
                mealRefs.current[fakeMeal.index]!.style.opacity = "1";
            }
            setFakeMeal(null);
            setIsClosing(false);
            window.history.pushState(null, "", `/dashboard`);
        }, 1000);
    }

    // Fetch meals from API based on current filter and auth state
    useEffect(() => {
        const fetchMeals = async () => {
            if (!isAuthenticated || !user) return;

            setLoading(true);
            try {
                // POST request for filtered meal search
                const data = await httpClient.post<{ results: Meal[] }>(`/api/v1/meals/search`, filter);
                setMeals(data.results);
                console.log("Fetched meals:", data.results);
            } catch (error) {
                console.error('Failed to fetch meals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, [user, isAuthenticated, filter]);

    // Sync URL search query with filter state
    useEffect(() => {
        if (query !== null && query !== filter.name) {
            setFilter(prev => ({ ...prev, name: query }));
        }
    }, [filter.name, query]);

    /**
     * Updates filter state while preserving search query from URL
     */
    const handleFilterChange = (newFilter: MealFilter) => {
        setFilter({
            ...newFilter,
            name: query || undefined
        });
    };

    return (
        <div className="flex w-full h-full relative">
            {/* Sidebar with filters - hidden on mobile */}
            <div className="hidden md:block w-80 mr-5 shrink-0 sticky h-full top-0">
                <MealFilterSidebar onFilterChange={handleFilterChange}/>
            </div>
            {/* Main content area with responsive meal grid */}
            <div className="flex w-full h-full pt-5 sm:px-5 px-2 relative overflow-y-auto">
                <div className="flex-1 space-y-5">
                    {/* Today's meal widget */}
                    <TodaysMealWidget
                        mealPlan={mealPlan}
                        isLoading={planLoading}
                        onMarkComplete={completeMealPlan}
                        onClear={clearMealPlan}
                        onSelectMeal={() => setShowMarkDialog(true)}
                    />

                    <div className="grid grid-cols-[repeat(auto-fill,_minmax(330px,_1fr))] w-full gap-5 content-baseline">
                    {/* Meal cards grid - each card stores ref for modal animation */}
                    {meals.map((meal, idx) => {
                            const image = meal.images[0].srcSetArray ? meal.images[0].srcSetArray[0] : meal.images[0].thumbnail;

                            return (
                                <MealCard mealId={meal.id} title={meal.name}
                                          description={"Hackbällchen in Tomatensauce mit Mozzarella überbacken"}
                                          imageUrl={image || "src/assets/meal-placeholder.png"}
                                          rating={meal.rating} prepTime={meal.time} key={idx}
                                          imgRef={el => {
                                              mealRefs.current[idx] = el
                                          }}
                                          handleImageClick={() => handleMealClick(idx, meal.id)}
                                          priority={idx < 10}/>
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
                                        priority={true}
                                        shouldClose={!showBackdrop}
                                    />

                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Mark meal dialog */}
            <MarkMealDialog
                isOpen={showMarkDialog}
                onClose={() => setShowMarkDialog(false)}
                onMealSelected={markMealForToday}
            />
        </div>
    );
}

export default DashboardPage;
