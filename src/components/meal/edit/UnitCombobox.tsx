/**
 * Searchable combobox for selecting measurement units with async loading from API.
 */

import {AsyncCombobox} from '@/components/ui/async-combobox';
import type {Unit} from '@/types/meal';
import {Check} from 'lucide-react';
import {cn} from '@/lib/utils';

interface UnitComboboxProps {
    value?: Unit;
    onChange: (u?: Unit) => void;
    limit?: number;
    defaultItems?: Unit[];
}

/**
 * Unit selection combobox with search and async data fetching.
 * Displays both full name and abbreviation for each unit.
 * 
 * @param value - Currently selected unit
 * @param onChange - Callback when unit selection changes
 * @param limit - Maximum number of results to fetch (default: 10)
 * @param defaultItems - Optional initial unit list to display
 * @returns AsyncCombobox configured for unit selection
 */
export function UnitCombobox({value, onChange, limit = 10, defaultItems}: UnitComboboxProps) {
    return (
        <AsyncCombobox<Unit>
            value={value}
            onChange={onChange}
            fetchUrl="/api/v1/units"
            limit={limit}
            getLabel={(u) => u.abbreviation ?? u.fullName ?? u.id}
            getValue={(u) => u.id}
            defaultItems={defaultItems}
            placeholder="Einheit"
            searchPlaceholder="Search unit..."
            renderOption={(it, isSelected) => (
                <>
                    {`${it.fullName} (${it.abbreviation})`}
                    <Check
                        className={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')}
                    />
                </>
            )}
        />
    );
}
