import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select";
import { AsyncCombobox } from "@/components/ui/async-combobox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { MealFilter, Ingredient } from "@/types/meal";
import type { UserResponse } from "@/types/auth";
import { httpClient } from "@/services/httpClient";
import { Checkbox } from "@/components/ui/checkbox";

interface MealFilterSidebarProps {
    onFilterChange: (filter: MealFilter) => void;
    className?: string;
}

export const MealFilterSidebar: React.FC<MealFilterSidebarProps> = ({ onFilterChange, className }) => {
    const [filter, setFilter] = useState<MealFilter>({
        limit: 20,
        skip: 0,
        sortBy: "RELEVANCE"
    });

    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [users, setUsers] = useState<UserResponse[]>([]);

    useEffect(() => {
        // Fetch users only
        const fetchData = async () => {
            try {
                const usersData = await httpClient.get<UserResponse[]>('/api/v1/users');
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch filter data", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (key: keyof MealFilter, value: any) => {
        const newFilter = { ...filter, [key]: value };
        setFilter(newFilter);
    };

    const handleAddIngredient = (ingredient?: Ingredient) => {
        if (!ingredient) return;
        if (selectedIngredients.some(i => i.id === ingredient.id)) return;

        const newSelected = [...selectedIngredients, ingredient];
        setSelectedIngredients(newSelected);
        handleChange("ingredients", newSelected.map(i => i.id));
    };

    const handleRemoveIngredient = (id: string) => {
        const newSelected = selectedIngredients.filter(i => i.id !== id);
        setSelectedIngredients(newSelected);
        handleChange("ingredients", newSelected.map(i => i.id));
    };

    const handleApply = () => {
        onFilterChange(filter);
    };

    return (
        <div className={`p-4 space-y-4 border-r bg-background h-full overflow-y-auto ${className}`}>
            <h2 className="font-semibold text-lg">Filters</h2>

            <div className="space-y-2">
                <Label>Time (min)</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filter.minTime || ""}
                        onChange={(e) => handleChange("minTime", e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filter.maxTime || ""}
                        onChange={(e) => handleChange("maxTime", e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Ingredients</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedIngredients.map(ing => (
                        <Badge key={ing.id} variant="secondary" className="gap-1">
                            {ing.name}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveIngredient(ing.id)} />
                        </Badge>
                    ))}
                </div>
                <AsyncCombobox<Ingredient>
                    value={undefined}
                    onChange={handleAddIngredient}
                    fetchUrl="/api/v1/ingredients"
                    getLabel={(i) => i.name}
                    getValue={(i) => i.id}
                    placeholder="Add ingredient..."
                    searchPlaceholder="Search ingredients..."
                    renderOption={(it) => <>{it.name}</>}
                />
            </div>

             <div className="space-y-2">
                <Label>Min Ingredient Match</Label>
                <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="0.0 - 1.0"
                    value={filter.minIngredientMatch || ""}
                    onChange={(e) => handleChange("minIngredientMatch", e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            <div className="space-y-2">
                <Label>Users</Label>
                <MultiSelect
                    values={filter.userIds || []}
                    onValuesChange={(values) => handleChange("userIds", values)}
                >
                    <MultiSelectTrigger>
                        <MultiSelectValue placeholder="Select users" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                        <MultiSelectGroup>
                            {Array.isArray(users) && users.map(u => (
                                <MultiSelectItem key={u.id} value={u.id}>
                                    {u.name}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectGroup>
                    </MultiSelectContent>
                </MultiSelect>
            </div>

            <div className="space-y-2">
                <Label>Min User Rating</Label>
                <Input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="1-5"
                    value={filter.minUserRating || ""}
                    onChange={(e) => handleChange("minUserRating", e.target.value ? Number(e.target.value) : undefined)}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="requireUserRatingMatch"
                    checked={filter.requireUserRatingMatch || false}
                    onCheckedChange={(checked) => handleChange("requireUserRatingMatch", checked)}
                />
                <Label htmlFor="requireUserRatingMatch">Require Rating Match</Label>
            </div>

            <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                    value={filter.sortBy}
                    onValueChange={(value) => handleChange("sortBy", value)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="RELEVANCE">Relevance</SelectItem>
                        <SelectItem value="RATING">Rating</SelectItem>
                        <SelectItem value="TIME_ASC">Time (asc)</SelectItem>
                        <SelectItem value="TIME_DESC">Time (desc)</SelectItem>
                        <SelectItem value="INGREDIENT_MATCH">Ingredient Match</SelectItem>
                        <SelectItem value="USER_AVG_RATING">User Avg Rating</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleApply} className="w-full">Apply Filters</Button>
        </div>
    );
};

