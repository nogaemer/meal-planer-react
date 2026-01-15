/**
 * Sortable instruction steps editor with drag-and-drop and mobile-friendly controls.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {closestCenter, DndContext, type DragEndEvent} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {ChevronDown, ChevronUp, GripVertical, Trash} from 'lucide-react';
import InstructionsNumberBgOval from "@/assets/react/InstructionsNumberBgOval.tsx";

type Step = { id: string; text: string };

/**
 * Individual sortable instruction step with numbered badge, textarea, and control buttons.
 * Provides drag-and-drop on desktop and up/down buttons on mobile.
 */
function SortableStep({
    step,
    index,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    isPlaceholder,
    id
}: {
    step: Step;
    index: number;
    onChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    isPlaceholder: boolean;
    id: string
}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto'
    } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style}
             className="grid grid-cols-[auto_1fr] md:flex md:items-center md:gap-4 rounded-md">
            {/* Numbered badge on left side */}
            <div
                className="relative shrink-0 md:h-16 md:w-16 w-8 h-8 md:p-0 p-6 justify-center row-start-1 col-start-1">
                <InstructionsNumberBgOval className={"md:block hidden"}/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold text-4xl">{index + 1}</span>
                </div>
            </div>

            {/* Textarea for step content */}
            <div className="flex-1 h-full row-start-2 col-span-2 md:row-start-auto md:col-span-auto">
                <Textarea
                    placeholder="Dein Rezept hier..."
                    value={step.text}
                    onChange={(e) => onChange(id, e.target.value)}
                    className="border-0 bg-muted dark:bg-muted resize-none p-4 opacity-100 h-20"
                />
            </div>

            {/* Control buttons: Up/Down arrows (mobile), Drag handle (desktop), Delete (both) */}
            <div
                className="flex flex-row md:flex-col items-center justify-end md:justify-between gap-2 row-start-1 col-start-2 md:row-start-auto md:col-start-auto md:w-12">
                {!isPlaceholder && (
                    <>
                        {/* Mobile: Move Up */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onMoveUp(index)}
                            disabled={!canMoveUp}
                            aria-label="Move step up"
                            className="md:hidden"
                        >
                            <ChevronUp className="h-4 w-4"/>
                        </Button>

                        {/* Mobile: Move Down */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onMoveDown(index)}
                            disabled={!canMoveDown}
                            aria-label="Move step down"
                            className="md:hidden"
                        >
                            <ChevronDown className="h-4 w-4"/>
                        </Button>

                        {/* Desktop: Drag Handle */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="hidden md:flex cursor-grab active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                            aria-label="Drag handle"
                        >
                            <GripVertical className="h-4 w-4"/>
                        </Button>

                        {/* Delete button (visible on all screen sizes) */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="hover:text-destructive"
                            onClick={() => onDelete(id)}
                            aria-label="Delete step"
                        >
                            <Trash className="h-4 w-4"/>
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}


/** Ensures list always has a trailing empty step for adding new instructions */
const ensureTrailingEmpty = (list: Step[], nextIdRef: React.MutableRefObject<number>) => {
    const last = list[list.length - 1];
    if (!last || !last.text || last.text.trim() === '') {
        return list;
    }
    const id = String(nextIdRef.current++);
    return [...list, {id, text: ''}];
};

/**
 * Instructions form section with drag-and-drop reordering and dynamic step management.
 * Automatically adds a trailing empty step and filters out empty steps on change.
 * 
 * @param value - Array of instruction text strings
 * @param onChange - Callback with filtered non-empty instruction steps
 * @returns Sortable list of instruction steps with numbered badges
 */
export const MealFormInstructions = ({value, onChange}: { value: string[]; onChange: (next: string[]) => void; }) => {
    const initial: Step[] = value.length > 0
        ? value.map((text, idx) => ({id: String(idx + 1), text}))
        : [{id: '1', text: ''}, {id: '2', text: ''}];

    const nextIdRef = useRef(initial.length + 1);
    const [steps, setSteps] = useState<Step[]>(ensureTrailingEmpty(initial, nextIdRef));

    // Sync non-empty steps back to parent
    useEffect(() => {
        onChange(steps.filter((step) => step.text.trim().length > 0).map((step) => step.text));
    }, [steps, onChange]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const {active, over} = event;
        if (!over) return;
        if (active.id !== over.id) {
            setSteps((prev) => {
                const oldIndex = prev.findIndex((p) => p.id === active.id);
                const newIndex = prev.findIndex((p) => p.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }, []);

    /** Updates step text and adds trailing empty row if user edited the last step */
    const updateStepText = (id: string, text: string) => {
        setSteps(prev => {
            const next = prev.map(s => s.id === id ? {...s, text} : s);
            const editedIndex = next.findIndex(s => s.id === id);
            if (editedIndex === next.length - 1 && next[editedIndex].text.trim()) {
                return ensureTrailingEmpty(next, nextIdRef);
            }
            return next;
        })
    }

    /** Removes a step unless it's the trailing empty placeholder */
    const deleteStep = (id: string) => {
        setSteps(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === id && (!last.text || last.text.trim() === '')) return prev;
            const next = prev.filter(s => s.id !== id);
            return ensureTrailingEmpty(next, nextIdRef);
        })
    }

    const moveUp = (index: number) => {
        setSteps(prev => {
            if (index <= 0) return prev;
            return arrayMove(prev, index, index - 1);
        });
    };

    const moveDown = (index: number) => {
        setSteps(prev => {
            // Prevent moving past the last real item (into the placeholder spot)
            if (index >= prev.length - 2) return prev;
            return arrayMove(prev, index, index + 1);
        });
    };

    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <div className="mb-4 text-lg font-semibold">Zubereitungsschritte</div>

            {/* Drag-and-drop context for desktop reordering */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-6">
                        {steps.map((step, idx) => {
                            const isPlaceholder = idx === steps.length - 1;
                            const canMoveUp = idx > 0 && !isPlaceholder;
                            // Can move down if not the last item and not immediately before placeholder
                            const canMoveDown = idx < steps.length - 2;

                            return (
                                <SortableStep
                                    key={step.id}
                                    step={step}
                                    index={idx}
                                    onChange={updateStepText}
                                    onDelete={deleteStep}
                                    onMoveUp={moveUp}
                                    onMoveDown={moveDown}
                                    canMoveUp={canMoveUp}
                                    canMoveDown={canMoveDown}
                                    isPlaceholder={isPlaceholder}
                                    id={step.id}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
