import { AsyncCombobox } from '@/components/ui/async-combobox';
import type { Unit } from '@/types/meal';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnitComboboxProps {
  value?: Unit;
  onChange: (u?: Unit) => void;
  limit?: number;
}

export function UnitCombobox({ value, onChange, limit = 10 }: UnitComboboxProps) {
  return (
    <AsyncCombobox<Unit>
      value={value}
      onChange={onChange}
      fetchUrl="/api/v1/units"
      limit={limit}
      getLabel={(u) => u.abbreviation ?? u.fullName ?? u.id}
      getValue={(u) => u.id}
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
