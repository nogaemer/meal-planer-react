import {Button} from "@/components/ui/button.tsx";

interface MealFormHeaderProps {
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export const MealFormHeader = ({onCancel, onSubmit, isSubmitting}: MealFormHeaderProps) => {
    return (
        <div className="flex justify-between p-6 bg-card rounded-3xl sm:flex-row flex-col gap-4 sm:gap-0 ">
            <h1 className="text-2xl font-bold">Rezept bearbeiten</h1>
            <div className="flex gap-4">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Abbrechen
                </Button>
                <Button variant="secondary" type="button" onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Speichern…" : "Speichern"}
                </Button>
            </div>
        </div>
    )
}