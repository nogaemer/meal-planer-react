/**
 * Form section for managing meal ingredients with dynamic rows and auto-fetched suggestions.
 */

import {useEffect, useRef, useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Trash} from 'lucide-react';
import type {Ingredient, MealIngredient, Unit} from "@/types/meal.ts";
import { UnitCombobox } from './UnitCombobox';
import {IngredientCombobox} from "@/components/meal/edit/IngredientCombobox.tsx";
import {httpClient} from "@/services/httpClient.ts";

type IngredientRow = {
    id: string;
    ingredient: Ingredient | undefined;
    amount: string;
    unit: Unit | undefined;
};

interface MealFormIngredientsProps {
    value: MealIngredient[];
    onChange: (rows: MealIngredient[]) => void;
}

/**
 * Dynamic ingredient list with automatic trailing empty row for adding new entries.
 * When an ingredient is selected, its default unit is automatically populated.
 * 
 * @param value - Array of meal ingredients
 * @param onChange - Callback with filtered complete ingredients (empty rows excluded)
 * @returns Grid-based ingredient input with ingredient, amount, unit, and delete button
 */
export const MealFormIngredients = ({value, onChange}: MealFormIngredientsProps) => {
    const nextId = useRef(value.length + 1);
    const [defaultIngredients, setDefaultIngredients] = useState<Ingredient[]>([]);
    const [defaultUnits, setDefaultUnits] = useState<Unit[]>([]);

    /** Checks if a row is completely empty (ready for deletion or can be skipped) */
    const isEmptyRow = (r: IngredientRow) => {
        return (!r.ingredient) && (!r.amount || r.amount.trim() === '') && (!r.unit);
    };

    /** Ensures there's always a trailing empty row for adding new ingredients */
    const ensureTrailingEmpty = (list: IngredientRow[]) => {
        const last = list[list.length - 1];
        if (!last || isEmptyRow(last)) {
            return list;
        }

        nextId.current++
        console.log("nextId.current:", nextId.current);
        const id = `r-${nextId.current}`;
        return [...list, {id, ingredient: undefined, amount: '', unit: undefined}];
    };

    const mapToRows = (vals: MealIngredient[]): IngredientRow[] =>
        vals.map((ing, i) => ({
            id: `r-${i + 1}`,
            ingredient: ing.ingredient,
            amount: ing.amount ?? '',
            unit: ing.unit ?? undefined,
        }));

    const baseRows = value.length ? mapToRows(value) : [
        {id: 'r-1', ingredient: undefined, amount: '', unit: undefined},
        {id: 'r-2', ingredient: undefined, amount: '', unit: undefined},
    ];

    const [rows, setRows] = useState<IngredientRow[]>(ensureTrailingEmpty(baseRows));

    // Sync internal rows with parent state, filtering out incomplete entries
    useEffect(() => {
        onChange(
            rows
                .filter((row) => !isEmptyRow(row) && row.ingredient !== undefined && row.unit !== undefined)
                .map((row) => ({ ingredient: row.ingredient as Ingredient, amount: row.amount, unit: row.unit as Unit }))
        );
    }, [rows, onChange]);

    /** Updates a row and auto-populates unit when ingredient is selected */
    const updateRow = (id: string, patch: Partial<IngredientRow>) => {
        // Auto-populate unit from ingredient's default unit
        if (patch.ingredient != null){
            patch.unit = patch.ingredient.unit;
        }

        setRows(prev => {
            const next = prev.map(r => r.id === id ? {...r, ...patch} : r);
            const editedIndex = next.findIndex(r => r.id === id);
            // Add trailing empty row if user edited the last row
            if (editedIndex === next.length - 1 && !isEmptyRow(next[editedIndex])) {
                return ensureTrailingEmpty(next);
            }
            return next;
        });
    };

    /** Removes a row unless it's the last empty placeholder */
    const removeRow = (id: string) => {
        setRows(prev => {
            const last = prev[prev.length - 1];
            // Prevent removing the trailing empty row
            if (last && last.id === id && isEmptyRow(last)) return prev;
            const next = prev.filter(r => r.id !== id);
            return ensureTrailingEmpty(next);
        });
    };

    // Fetch default suggestions for ingredients and units on mount
    useEffect(() => {
        const fetchDefaultValues = async () => {
            try {
                const ingredients = await httpClient.get<Ingredient[]>('/api/v1/ingredients?limit=10');
                setDefaultIngredients(ingredients);

                const units = await httpClient.get<Unit[]>('/api/v1/units?limit=10');
                setDefaultUnits(units);
            } catch (error) {
                console.error("Failed to fetch default ingredients:", error);
            }
        };
        fetchDefaultValues();
    }, []);

    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <div className="mb-4 text-lg font-semibold">Zutaten</div>

            <div className="grid grid-cols-[1fr_80px_100px_20px] items-center gap-4 mb-3">
                <div className="text-sm font-medium">Zutat</div>
                <div className="text-sm font-medium">Anzahl</div>
                <div className="text-sm font-medium">Einheit</div>
                <div/>
            </div>

            <div className="flex flex-col gap-4">
                {rows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr_80px_100px_20px] items-center gap-4">
                        <div>
                            <IngredientCombobox value={row.ingredient} defaultItems={defaultIngredients} onChange={(i) => updateRow(row.id, { ingredient: i })} />
                        </div>

                        <div>
                            <Input value={row.amount} onChange={(e) => updateRow(row.id, {amount: e.target.value})}
                                   placeholder="Anzahl"/>
                        </div>

                        <div>
                            <UnitCombobox value={row.unit} defaultItems={defaultUnits} onChange={(u) => updateRow(row.id, { unit: u })} />
                        </div>

                        <div className="flex items-center justify-center">
                            <Button variant="outline" size="icon" className="bg-transparent dark:bg-transparent hover:text-destructive" onClick={() => removeRow(row.id)} aria-label="Löschen">
                                <Trash/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No separate add button — trailing empty row is used for adding new ingredients */}
        </div>
    );
};
