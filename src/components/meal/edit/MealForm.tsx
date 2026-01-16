/**
 * Main form component for creating and editing meal recipes with validation and submission logic.
 */

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {MealFormHeader} from "@/components/meal/edit/MealFormHeader.tsx";
import {MealFormMetaData, type MealMetaDataValue} from "@/components/meal/edit/MealFormMetaData.tsx";
import {MealFormInstructions} from "@/components/meal/edit/MealFormInstructions.tsx";
import {MealFormImageContainer} from "@/components/meal/edit/MealFormImageContainer.tsx";
import {MealFormIngredients} from "@/components/meal/edit/MealFormIngredients.tsx";
import type {Image, MealIngredient, Meal, MealUpload, Tag} from "@/types/meal.ts";
import {httpClient} from "@/services/httpClient.ts";

interface MealFormProps {
    id?: string;
    mealInit?: Meal;
}

/** Creates a default empty meal object with initial values */
const createDefaultMeal = (): Meal => ({
    id: "",
    name: "",
    description: "",
    ingredients: [] as MealIngredient[],
    instructions: [] as string[],
    tags: [] as Tag[],
    images: [] as Image[],
    difficulty: "",
    time: 0,
    portions: 1,
    calories: 0,
    url: "",
    rating: 0,
    ratings: [],
    notes: []
});

/** Removes empty or whitespace-only instruction steps */
const sanitizeInstructions = (list: string[]) =>
    list.map((step) => step.trim()).filter((step) => step.length > 0);


/**
 * Main meal form component for creating and editing recipes.
 * 
 * @param id - Optional meal ID for editing existing meals
 * @param mealInit - Optional initial meal data for editing mode
 * @returns A comprehensive form with metadata, ingredients, instructions, and image management
 */
export const MealForm = ({
    id,
    mealInit,
    ...props
}: MealFormProps & React.HTMLAttributes<HTMLDivElement>) => {
    const navigate = useNavigate();
    const [meal, setMeal] = useState<Meal>(() => mealInit ?? createDefaultMeal());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log(mealInit)
    }, [mealInit])

    // Memoized metadata with string-converted numeric fields for form inputs
    const meta = useMemo<MealMetaDataValue>(() => ({
        name: meal.name,
        description: meal.description,
        difficulty: meal.difficulty,
        time: String(meal.time),
        portions: String(meal.portions),
        calories: String(meal.calories),
        tags: meal.tags
    }), [meal]);

    // Partially updates meal metadata while converting string inputs to numbers
    const setMeta = useCallback((patch: Partial<MealMetaDataValue>) => {
        console.log();
        setMeal((prev: Meal) => ({
            ...prev,
            name: patch.name ?? prev.name,
            difficulty: patch.difficulty ?? prev.difficulty,
            description: patch.description ?? prev.description,
            time: patch.time !== undefined ? Number(patch.time) : prev.time,
            portions: patch.portions !== undefined ? Number(patch.portions) : prev.portions,
            calories: patch.calories !== undefined ? Number(patch.calories) : prev.calories,
            tags: patch.tags !== undefined ? patch.tags : prev.tags,
        }));
    }, []);

    const setInstructions = useCallback((newInstructions: string[]) => {
        setMeal((prev: Meal) => ({...prev, instructions: newInstructions}));
    }, []);

    const setImages = useCallback((newImages: Image[]) => {
        setMeal((prev: Meal) => ({...prev, images: newImages}));
        console.log(newImages)
    }, []);

    const setIngredients = useCallback((newIngredients: MealIngredient[]) => {
        setMeal(prev => ({ ...prev, ingredients: newIngredients }));
    }, []);

    const handleCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const resetForm = useCallback(() => {
        setMeal(createDefaultMeal());
    }, []);

    /**
     * Validates and submits the meal form.
     * Performs client-side validation for all required fields before API submission.
     * Creates new meal or updates existing meal based on presence of ID.
     */
    const handleSubmit = useCallback(async () => {
        // Validate meal name
        const trimmedName = meal.name.trim();
        if (!trimmedName) {
            toast.error("Bitte einen Rezeptnamen angeben.");
            return;
        }

        // Validate difficulty selection
        if (!meal.difficulty) {
            toast.error("Bitte eine Schwierigkeit auswählen.");
            return;
        }

        // Validate time (must be positive number)
        const time = Number(meal.time);
        if (!Number.isFinite(time) || time <= 0) {
            toast.error("Bitte eine gültige Zubereitungszeit angeben.");
            return;
        }

        // Validate portions (must be positive number)
        const portions = Number(meal.portions);
        if (!Number.isFinite(portions) || portions <= 0) {
            toast.error("Bitte eine gültige Portionszahl angeben.");
            return;
        }

        // Validate calories (must be positive number)
        const calories = Number(meal.calories);
        if (!Number.isFinite(calories) || calories <= 0) {
            toast.error("Bitte einen gültigen Kalorienwert angeben.");
            return;
        }

        // Validate at least one ingredient exists
        if (meal.ingredients.length === 0) {
            toast.error("Bitte mindestens eine Zutat hinzufügen.");
            return;
        }

        // Validate at least one instruction step exists after sanitization
        const normalizedInstructions = sanitizeInstructions(meal.instructions);
        if (normalizedInstructions.length === 0) {
            toast.error("Bitte mindestens einen Schritt hinzufügen.");
            return;
        }

        const payload: MealUpload = {
            name: trimmedName,
            difficulty: meta.difficulty,
            time,
            portions,
            calories,
            ingredients: meal.ingredients,
            instructions: normalizedInstructions,
            images: meal.images,
            tags: meta.tags,
        };

        console.log(payload)

        try {
            setIsSubmitting(true);

            // Update existing meal or create new one based on presence of ID
            if (id) {
                const meal = await httpClient.put<Meal>(`/api/v1/meals/${id}`, payload);
                toast.success("Rezept erfolgreich aktualisiert.");
                navigate(`/meal/${meal.id}`)
            } else {
                const meal = await httpClient.post<Meal>("/api/v1/meals", payload);
                toast.success("Rezept erfolgreich erstellt.");
                navigate(`/meal/${meal.id}`)
            }

            resetForm();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Speichern fehlgeschlagen.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [id, meal.calories, meal.difficulty, meal.id, meal.images, meal.ingredients,
        meal.instructions, meal.name, meal.portions, meal.time, meta.difficulty, meta.tags, navigate, resetForm]);

    return (
        <div className={`flex relative overflow-y-scroll p-5 sm:px-10 justify-center bg-accent`}
             style={{scrollbarWidth: "none"}}
             {...props}>
            <div className="flex flex-col w-full xl:max-w-7xl max-w-2xl gap-4">
                {/* Header with cancel and save buttons */}
                <MealFormHeader onCancel={handleCancel} onSubmit={handleSubmit} isSubmitting={isSubmitting}/>
                {/* Two-column layout: metadata/instructions on left, images/ingredients on right */}
                <div className="flex xl:flex-row flex-col gap-4 w-full">
                    <div className="flex flex-col gap-4 xl:w-2/3">
                        <MealFormMetaData value={meta} onChange={setMeta}/>
                        <MealFormInstructions value={meal.instructions} onChange={setInstructions}/>
                    </div>
                    <div className="flex flex-col gap-4 xl:w-lg">
                        <MealFormImageContainer images={meal.images} onChange={setImages}/>
                        <MealFormIngredients value={meal.ingredients} onChange={setIngredients}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
