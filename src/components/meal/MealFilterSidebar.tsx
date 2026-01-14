import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion"; // Ensure you have this component
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select";

import {ChefHat, Clock, Filter, Star} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import type {Ingredient, MealFilter, SortParameter} from "@/types/meal";
import {cn} from "@/lib/utils";
import {httpClient} from "@/services/httpClient.ts";
import type {UserResponse} from "@/types/auth.ts";

interface MealFilterSidebarProps {
    onFilterChange: (filter: MealFilter) => void;
    className?: string;
}

export const MealFilterSidebar: React.FC<MealFilterSidebarProps> = ({
    onFilterChange,
    className
}) => {
    const [filter, setFilter] = useState<MealFilter>({
        limit: 20,
        skip: 0,
    });

    const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
    const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);

    const [sortParameters, setSortParameters] = useState<SortParameter[]>([]); // Typed as any for brevity, use UserResponse

    useEffect(() => {
        const fetchData = async () => {
            try {
                const filterData = await httpClient
                    .get<{ users: UserResponse[]; sortParameters: SortParameter[] }>('/api/v1/filters');

                setSortParameters(filterData.sortParameters);
                handleChange("sortBy", filterData.sortParameters[0]?.id);
            } catch (error) {
                console.error("Failed to fetch filter data", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const query = userSearchQuery ? `?name=${encodeURIComponent(userSearchQuery)}` : '';
                const data = await httpClient.get<UserResponse[]>(`/api/v1/filters/users${query}`);
                setAvailableUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, [userSearchQuery]);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const query = ingredientSearchQuery ? `?name=${encodeURIComponent(ingredientSearchQuery)}` : '';
                const data = await httpClient.get<Ingredient[]>(`/api/v1/ingredients${query}`);
                setAvailableIngredients(data);
            } catch (error) {
                console.error("Failed to fetch ingredients", error);
            }
        };
        fetchIngredients();
    }, [ingredientSearchQuery]);

    const handleChange = (key: keyof MealFilter, value: any) => {
        const newFilter = {...filter, [key]: value};
        setFilter(newFilter);
    };

    return (
        <div className={cn("flex h-full flex-col bg-card overflow-y-auto", className)}>
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2 font-semibold">
                    <Filter className="h-4 w-4"/>
                    <span>Filters</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                        const newFilter = {limit: 20, skip: 0, sortBy: sortParameters.filter(sp => sp.selected)[0]?.id};
                        setFilter(newFilter);
                        setSelectedIngredientIds([]);
                        setSelectedUserIds([]);
                        onFilterChange(newFilter);
                    }}
                >
                    Reset
                </Button>
            </div>

            {/* SCROLLABLE FILTERS */}
            <div className="flex-1 space-y-6 py-4 px-4">

                {/* SORT BY */}
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Sort By</Label>
                    <Select
                        value={filter.sortBy || sortParameters.filter(sp => sp.selected)[0]?.id}
                        onValueChange={(val) => handleChange("sortBy", val)}
                    >
                        <SelectTrigger className="w-full" aria-label="Sort by">
                            <SelectValue placeholder="Sort by..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {sortParameters.map((sp) => (
                                <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator/>

                <Accordion type="multiple" defaultValue={["ingredients", "time", "advanced"]} className="w-full">

                    {/* TIME FILTER */}
                    <AccordionItem value="time" className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <span>Prep Time</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <div className="flex items-center gap-2">
                                <div className="space-y-1 flex-1">
                                    <Label htmlFor="min-time" className="text-xs text-muted-foreground">Min (min)</Label>
                                    <Input
                                        id="min-time"
                                        type="number"
                                        placeholder="0"
                                        className="h-8"
                                        onChange={(e) => handleChange("minTime", e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                                <span className="mt-5 text-muted-foreground">-</span>
                                <div className="space-y-1 flex-1">
                                    <Label htmlFor="max-time" className="text-xs text-muted-foreground">Max (min)</Label>
                                    <Input
                                        id="max-time"
                                        type="number"
                                        placeholder="60+"
                                        className="h-8"
                                        onChange={(e) => handleChange("maxTime", e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* INGREDIENTS FILTER */}
                    <AccordionItem value="ingredients" className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center gap-2 text-sm">
                                <ChefHat className="h-4 w-4 text-muted-foreground"/>
                                <span>Ingredients</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <div className="space-y-3">
                                <MultiSelect
                                    values={selectedIngredientIds}
                                    onValuesChange={(vals) => {
                                        setSelectedIngredientIds(vals);
                                        handleChange("ingredients", vals);
                                    }}
                                >
                                    <MultiSelectTrigger className="w-full" aria-label={"Select Ingredients"}>
                                        <MultiSelectValue placeholder="Add ingredient..." overflowBehavior={"wrap"}/>
                                    </MultiSelectTrigger>
                                    <MultiSelectContent onSearch={setIngredientSearchQuery} shouldFilter={false}>
                                        <MultiSelectGroup>
                                            {availableIngredients.map((ing) => (
                                                <MultiSelectItem key={ing.id} value={ing.id}>
                                                    {ing.name}
                                                </MultiSelectItem>
                                            ))}
                                        </MultiSelectGroup>
                                    </MultiSelectContent>
                                </MultiSelect>

                                <div className="space-y-1">
                                    <Label htmlFor="min-ingredients" className="text-xs text-muted-foreground">Min. Matched
                                        Ingredients</Label>
                                    <Input
                                        id="min-ingredients"
                                        type="number"
                                        placeholder="1"
                                        className="h-8"
                                        onChange={(e) => handleChange("minIngredientMatch", e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* RATINGS & USERS */}
                    <AccordionItem value="advanced" className="border-b-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-muted-foreground"/>
                                <span>Rating & Users</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="min-rating" className="text-xs text-muted-foreground">Min Rating (0-5)</Label>
                                    <Input
                                        id="min-rating"
                                        type="number"
                                        max={5}
                                        min={0}
                                        className="h-8"
                                        onChange={(e) => handleChange("minUserRating", e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Bewertet von</Label>
                                    <MultiSelect
                                        values={selectedUserIds}
                                        onValuesChange={(vals) => {
                                            setSelectedUserIds(vals);
                                            handleChange("userIds", vals);
                                        }}
                                    >
                                        <MultiSelectTrigger className="w-full" aria-label={"Select Users"}>
                                            <MultiSelectValue placeholder="User auswählen..." overflowBehavior={"wrap"} />
                                        </MultiSelectTrigger>
                                        <MultiSelectContent onSearch={setUserSearchQuery} shouldFilter={false}>
                                            <MultiSelectGroup>
                                                {availableUsers.map(user => (
                                                    <MultiSelectItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </MultiSelectItem>
                                                ))}
                                            </MultiSelectGroup>
                                        </MultiSelectContent>
                                    </MultiSelect>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </div>

            {/* FOOTER ACTION */}
            <div className="border-t p-4">
                <Button className="w-full" onClick={() => onFilterChange(filter)}>
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};
