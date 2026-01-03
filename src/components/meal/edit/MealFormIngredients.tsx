import {useEffect, useRef, useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Trash} from 'lucide-react';
import type {Ingredient, MealIngredient, Unit} from "@/types/meal.ts";
import { UnitCombobox } from './UnitCombobox';
import {IngredientCombobox} from "@/components/meal/edit/IngredientCombobox.tsx";

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

export const MealFormIngredients = ({value, onChange}: MealFormIngredientsProps) => {
    const nextId = useRef(value.length + 1);

    const isEmptyRow = (r: IngredientRow) => {
        return (!r.ingredient) && (!r.amount || r.amount.trim() === '') && (!r.unit);
    };

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

    useEffect(() => {
        onChange(
            rows
                .filter((row) => !isEmptyRow(row) && row.ingredient !== undefined && row.unit !== undefined)
                .map((row) => ({ ingredient: row.ingredient as Ingredient, amount: row.amount, unit: row.unit as Unit }))
        );
    }, [rows, onChange]);

    const updateRow = (id: string, patch: Partial<IngredientRow>) => {
        if (patch.ingredient != null){
            patch.unit = patch.ingredient.unit;
        }

        setRows(prev => {
            const next = prev.map(r => r.id === id ? {...r, ...patch} : r);
            const editedIndex = next.findIndex(r => r.id === id);
            if (editedIndex === next.length - 1 && !isEmptyRow(next[editedIndex])) {
                return ensureTrailingEmpty(next);
            }
            return next;
        });
    };

    const removeRow = (id: string) => {
        setRows(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === id && isEmptyRow(last)) return prev;
            const next = prev.filter(r => r.id !== id);
            return ensureTrailingEmpty(next);
        });
    };

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
                            <IngredientCombobox value={row.ingredient} onChange={(i) => updateRow(row.id, { ingredient: i })} />
                        </div>

                        <div>
                            <Input value={row.amount} onChange={(e) => updateRow(row.id, {amount: e.target.value})}
                                   placeholder="Anzahl"/>
                        </div>

                        <div>
                            <UnitCombobox value={row.unit} onChange={(u) => updateRow(row.id, { unit: u })} />
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
