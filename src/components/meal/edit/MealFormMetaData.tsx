import {Field, FieldGroup, FieldLabel, FieldLegend, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup, MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue
} from "@/components/ui/multi-select.tsx";
import type {Tag} from "@/types/meal.ts";
import {useEffect, useState} from "react";
import {httpClient} from "@/services/httpClient.ts";

export interface MealMetaDataValue {
    name: string;
    description: string;
    difficulty: string;
    time: string;
    portions: string;
    calories: string;
    tags: Tag[];
}

interface MealFormMetaDataProps {
    value: MealMetaDataValue;
    onChange: (patch: Partial<MealMetaDataValue>) => void;
}

export const MealFormMetaData = ({value, onChange}: MealFormMetaDataProps) => {
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await httpClient.request<Tag[]>(`/api/v1/tags?limit=10&query=${searchQuery}`);
                setAvailableTags(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
                setAvailableTags([]);
            }
        };

        const timeoutId = setTimeout(fetchTags, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleInput = (field: keyof MealMetaDataValue) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({[field]: event.target.value});
    };

    const handleDifficultyChange = (difficulty: string) => {
        onChange({difficulty});
    };

    const handleTagsChange = (newTags: string[]) => {
        // Map selected IDs back to Tag objects
        // We need to keep existing tags that might not be in availableTags (if they were already selected)
        // and add new ones from availableTags
        const currentTagsMap = new Map(value.tags.map(t => [t.id, t]));
        const availableTagsMap = new Map(availableTags.map(t => [t.id, t]));

        const updatedTags: Tag[] = [];
        newTags.forEach(tagId => {
            if (availableTagsMap.has(tagId)) {
                updatedTags.push(availableTagsMap.get(tagId)!);
            } else if (currentTagsMap.has(tagId)) {
                updatedTags.push(currentTagsMap.get(tagId)!);
            }
        });

        onChange({tags: updatedTags});
    };

    const tagsToDisplay = [...availableTags];
    const availableTagIds = new Set(availableTags.map(t => t.id));

    value.tags.forEach(tag => {
        if (!availableTagIds.has(tag.id)) {
            tagsToDisplay.push(tag);
        }
    });

    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Rezeptinformationen</FieldLegend>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="meal-name">Rezept Name</FieldLabel>
                            <Input
                                id="meal-name"
                                placeholder="Spaghetti"
                                required
                                value={value.name}
                                onChange={handleInput("name")}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="meal-description">Beschreibung</FieldLabel>
                            <Textarea
                                id="meal-description"
                                placeholder="Geben Sie eine kurze Beschreibung des Rezepts ein"
                                className="resize-y"
                                value={value.description}
                                onChange={handleInput("description")}
                            />
                        </Field>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="meal-difficulty">Schwierigkeit</FieldLabel>
                                <Select value={value.difficulty} onValueChange={handleDifficultyChange}>
                                    <SelectTrigger id="meal-difficulty">
                                        <SelectValue placeholder="Schwierigkeit wählen"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hard">Schwer</SelectItem>
                                        <SelectItem value="medium">Mittel</SelectItem>
                                        <SelectItem value="easy">Leicht</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="meal-time">Zeit in Minuten</FieldLabel>
                                <Input
                                    id="meal-time"
                                    placeholder="120"
                                    required
                                    inputMode="numeric"
                                    value={value.time === "0" || value.time === "NaN" ? "" : value.time}
                                    onChange={(e) => {
                                        if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
                                            handleInput("time")(e);
                                        }
                                    }}
                                />
                            </Field>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="meal-portions">Portionen</FieldLabel>
                                <Input
                                    id="meal-portions"
                                    placeholder="4"
                                    required
                                    inputMode="numeric"
                                    value={value.portions === "0" || value.portions === "NaN" ? "" : value.portions}
                                    onChange={(e) => {
                                        if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
                                            handleInput("portions")(e);
                                        }
                                    }}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="meal-calories">Kalorien</FieldLabel>
                                <Input
                                    id="meal-calories"
                                    placeholder="600"
                                    required
                                    inputMode="numeric"
                                    value={value.calories === "0" || value.calories === "NaN" ? "" : value.calories}
                                    onChange={(e) => {
                                        if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
                                            handleInput("calories")(e);
                                        }
                                    }}
                                />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="meal-tags">Tags</FieldLabel>
                            <MultiSelect
                                values={value.tags.map(t => t.id)}
                                onValuesChange={handleTagsChange}
                            >
                                <MultiSelectTrigger className="w-full md:max-w-[400px]">
                                    <MultiSelectValue placeholder="Tags auswählen..." />
                                </MultiSelectTrigger>
                                <MultiSelectContent onSearch={setSearchQuery} shouldFilter={false}>
                                    <MultiSelectGroup>
                                        {tagsToDisplay.map(tag => (
                                            <MultiSelectItem key={tag.id} value={tag.id}>
                                                {tag.name}
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelectGroup>
                                </MultiSelectContent>
                            </MultiSelect>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
        </div>
    );
};
