/**
 * Searchable combobox for selecting ingredients with async loading from API.
 */

import { AsyncCombobox } from '@/components/ui/async-combobox';
import type {Ingredient} from '@/types/meal';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientComboboxProps {
    value?: Ingredient;
    onChange: (i?: Ingredient) => void;
    defaultItems?: Ingredient[];
}

/**
 * Ingredient selection combobox with search and async data fetching.
 * 
 * @param value - Currently selected ingredient
 * @param onChange - Callback when ingredient selection changes
 * @param defaultItems - Optional initial ingredient list to display
 * @returns AsyncCombobox configured for ingredient selection
 */
export function IngredientCombobox({ value, onChange, defaultItems}: IngredientComboboxProps) {

    return (
        <AsyncCombobox<Ingredient>
            value={value}
            defaultItems={defaultItems}
            onChange={onChange}
            fetchUrl="/api/v1/ingredients"
            getLabel={(i) => i.name}
            getValue={(i) => i.id}
            placeholder="Zutat wählen"
            searchPlaceholder="Zutat suchen..."
            renderOption={(it, isSelected) => (
                <>
                    {it.name}
                    <Check
                        className={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                </>
            )}
        />
    );
}
