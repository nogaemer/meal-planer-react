import { AsyncCombobox } from '@/components/ui/async-combobox';
import type {Ingredient} from '@/types/meal'; // Assuming you have this type
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientComboboxProps {
    value?: Ingredient;
    onChange: (i?: Ingredient) => void;
}

export function IngredientCombobox({ value, onChange }: IngredientComboboxProps) {
    return (
        <AsyncCombobox<Ingredient>
            value={value}
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
