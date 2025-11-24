import {useRef, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Trash} from 'lucide-react';

type IngredientRow = {
    id: string;
    name: string;
    amount: string;
    unit: string;
};

const INGREDIENT_OPTIONS = ['Salz', 'Zucker', 'Mehl', 'Butter', 'Eier', 'Milch'];
const UNIT_OPTIONS = ['g', 'ml', 'Stück', 'TL', 'EL'];

export const MealEditIngredients = () => {
    const initialFilled: IngredientRow[] = [
        {id: 'r-1', name: '', amount: '', unit: ''},
        {id: 'r-2', name: '', amount: '', unit: ''},
    ];

    const nextId = useRef(7);

    // Ensure there's always a trailing empty row (unit empty string so it's considered empty)
    const [rows, setRows] = useState<IngredientRow[]>([...initialFilled, {id: `r-${nextId.current++}`, name: '', amount: '', unit: ''}]);

    const isEmptyRow = (r: IngredientRow) => {
        return (!r.name || r.name.trim() === '') && (!r.amount || r.amount.trim() === '') && (!r.unit || r.unit.trim() === '');
    };

    const ensureTrailingEmpty = (list: IngredientRow[]) => {
        const last = list[list.length - 1];
        if (!last || !isEmptyRow(last)) {
            const id = `r-${nextId.current++}`;
            return [...list, {id, name: '', amount: '', unit: ''}];
        }
        return list;
    };

    const updateRow = (id: string, patch: Partial<IngredientRow>) => {
        setRows(prev => {
            const next = prev.map(r => r.id === id ? {...r, ...patch} : r);
            // if user edited the trailing empty row (made it non-empty), ensure a new trailing empty row is appended
            const editedIndex = next.findIndex(r => r.id === id);
            if (editedIndex === next.length - 1 && !isEmptyRow(next[editedIndex])) {
                return ensureTrailingEmpty(next);
            }
            return next;
        });
    };

    const removeRow = (id: string) => {
        setRows(prev => {
            // don't allow removing the trailing empty row
            const last = prev[prev.length - 1];
            if (last && last.id === id && isEmptyRow(last)) return prev;
            const next = prev.filter(r => r.id !== id);
            // ensure at least one trailing empty row
            return ensureTrailingEmpty(next);
        });
    };

    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <div className="mb-4 text-lg font-semibold">Zutaten</div>

            <div className="grid grid-cols-[1fr_60px_100px_20px] items-center gap-4 mb-3">
                <div className="text-sm font-medium">Zutat</div>
                <div className="text-sm font-medium">Anzahl</div>
                <div className="text-sm font-medium">Einheit</div>
                <div/>
            </div>

            <div className="flex flex-col gap-4">
                {rows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr_60px_100px_20px] items-center gap-4">
                        <div>
                            <Select value={row.name} onValueChange={(val) => updateRow(row.id, {name: val})}>
                                <SelectTrigger size="default" className="w-full">
                                    <SelectValue placeholder="Zutat"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {INGREDIENT_OPTIONS.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Input value={row.amount} onChange={(e) => updateRow(row.id, {amount: e.target.value})}
                                   placeholder="Anzahl"/>
                        </div>

                        <div>
                            <Select value={row.unit} onValueChange={(val) => updateRow(row.id, {unit: val})}>
                                <SelectTrigger size="default" className="w-full">
                                    <SelectValue placeholder="Einheit"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {UNIT_OPTIONS.map(u => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
