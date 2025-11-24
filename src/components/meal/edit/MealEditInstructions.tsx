import React, {useCallback, useRef, useState} from 'react';
import {closestCenter, DndContext, type DragEndEvent} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {GripVertical, Trash} from 'lucide-react';
import InstructionsNumberBgOval from "@/assets/react/InstructionsNumberBgOval.tsx";

type Step = { id: string; text: string };

function SortableStep({step, index, onChange, onDelete, id}: {
    step: Step;
    index: number;
    onChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    id: string
}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto'
    } as React.CSSProperties;

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4">
            {/* left number badge */}
            <div className="relative shrink-0 h-16 w-16 justify-center">
                <InstructionsNumberBgOval/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-accent-foreground font-semibold text-4xl">{index + 1}</span>
                </div>
            </div>

            {/* center textarea */}
            <div className="flex-1 h-full">
                <Textarea
                    placeholder="Dein Rezept hier..."
                    value={step.text}
                    onChange={(e) => onChange(id, e.target.value)}
                    className="border-0 bg-muted dark:bg-muted resize-none p-4 opacity-100 h-20"
                />
            </div>

            {/* drag handle */}
            <div className="w-12 flex flex-col items-center justify-between gap-2">
                <Button variant="outline" size="icon" {...attributes} {...listeners} aria-label="Drag handle">
                    <GripVertical/>
                </Button>

                <Button variant="outline" size="icon" className="hover:text-destructive" onClick={() => onDelete(id)}
                        aria-label="Delete step">
                    <Trash/>
                </Button>
            </div>
        </div>
    )
}

export const MealEditInstructions = () => {
    // initial filled steps
    const initial: Step[] = [
        {id: '1', text: ''},
        {id: '2', text: ''},
    ];

    // next id counter (start after the ids used above)
    const nextIdRef = useRef(3);

    // include a trailing empty step so the user can add by typing
    const [steps, setSteps] = useState<Step[]>([...initial]);

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

    const isEmptyStep = (s: Step) => !s.text || s.text.trim() === '';

    const ensureTrailingEmpty = (list: Step[]) => {
        const last = list[list.length - 1];
        if (!last || !isEmptyStep(last)) {
            const id = String(nextIdRef.current++);
            return [...list, {id, text: ''}];
        }
        return list;
    }

    const updateStepText = (id: string, text: string) => {
        setSteps(prev => {
            const next = prev.map(s => s.id === id ? {...s, text} : s);
            const editedIndex = next.findIndex(s => s.id === id);
            // if the user typed into the trailing empty step, append a new trailing empty
            if (editedIndex === next.length - 1 && !isEmptyStep(next[editedIndex])) {
                return ensureTrailingEmpty(next);
            }
            return next;
        })
    }

    const deleteStep = (id: string) => {
        setSteps(prev => {
            const last = prev[prev.length - 1];
            // don't allow deleting the trailing empty step
            if (last && last.id === id && isEmptyStep(last)) return prev;
            const next = prev.filter(s => s.id !== id);
            return ensureTrailingEmpty(next);
        })
    }

    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <div className="mb-4 text-lg font-semibold">Zubereitungsschritte</div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-6">
                        {steps.map((step, idx) => (
                            <SortableStep key={step.id} step={step} index={idx} onChange={updateStepText}
                                          onDelete={deleteStep} id={step.id}/>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* No separate add button — users add steps by typing into the trailing empty step */}
        </div>
    );
}