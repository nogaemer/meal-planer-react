import {Button} from "@/components/ui/button.tsx";

export const MealEditHeader = () => {
    return (
        <div className="flex justify-between p-6 bg-card rounded-3xl">
            <h1 className="text-2xl font-bold">Rezept bearbeiten</h1>
            <div className="flex gap-4">
                <Button variant="outline">Abbrechen</Button>
                <Button variant="secondary">Speichern</Button>
            </div>
        </div>
    )
}