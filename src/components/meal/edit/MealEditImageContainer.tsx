import {FieldGroup, FieldLegend, FieldSet} from "@/components/ui/field.tsx";
import {type ChangeEvent, useRef, useState} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,} from "@/components/ui/empty"
import {File, Trash} from "lucide-react";

export const MealEditImageContainer = () => {
    const [images, setImages] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const onAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const url = URL.createObjectURL(file);
            newImages.push(url);
        }
        setImages(prev => [...prev, ...newImages]);
        // select newly added image
        setSelectedIndex(images.length);
        // clear input so same file can be added again if needed
        e.currentTarget.value = "";
    }

    const removeImage = (index: number) => {
        URL.revokeObjectURL(images[index]);
        setImages(prev => {
            const next = prev.filter((_, i) => i !== index);
            // release object URL if it was created from a file
            // (we can't easily know; in this simple implementation we won't track origins)
            if (selectedIndex >= next.length) {
                setSelectedIndex(Math.max(0, next.length - 1));
            }
            return next;
        });
    }

    return (
        <div className="w-full bg-card p-6 rounded-3xl h-fit">
            <form>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Bilder</FieldLegend>
                        <FieldGroup>
                            <div className="w-full">
                                {/* Main preview */}
                                <div className="mb-4 w-full rounded-xl overflow-hidden">
                                    {images && images.length > 0 ? (
                                        <img
                                            src={images[selectedIndex]}
                                            alt={`Bild ${selectedIndex + 1}`}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        // <div
                                        //     className="w-full h-64 flex items-center justify-center text-muted-foreground">
                                        //     Kein Bild
                                        // </div>
                                        <Empty className="border-2 border-dashed rounded-xl">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <File/>
                                                </EmptyMedia>
                                                <EmptyTitle>Keine Bilder</EmptyTitle>
                                                <EmptyDescription>
                                                    Lade Bilder hoch, um sie später in diesem Rezept zu verwenden.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <Button variant="outline" size="sm" type="button"
                                                        onClick={() => setDialogOpen(true)}>
                                                    Bilder hochladen
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    )}
                                </div>

                                {/* Thumbnails row */}
                                <div className="flex items-center gap-3">
                                    {images.length > 0 && <div
                                        className="flex gap-3 overflow-x-auto overflow-y-hidden rounded-lg"
                                        onWheel={(e) => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                                                el.scrollBy({left: e.deltaY!, behavior: "smooth"});
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        {images.map((src, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedIndex(idx)}
                                                className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border ${selectedIndex === idx ? 'border-primary' : 'border-transparent'} p-0`}
                                            >
                                                <img src={src} alt={`thumb-${idx}`}
                                                     className="w-full h-full object-cover"/>
                                            </button>
                                        ))}
                                    </div>}

                                    {/* Add tile opens dialog */}
                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger asChild className="cursor-pointer">
                                            <Button type="button" variant="dashed"
                                                    className="w-20 h-20 shrink-0 rounded-lg  flex items-center justify-center text-secondary">
                                                <span className="text-2xl">+</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogTitle>Bilder verwalten</DialogTitle>
                                            <DialogDescription className="mb-4">Hier kannst du Bilder hinzufügen oder
                                                entfernen.</DialogDescription>

                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="mb-4">
                                                    <input
                                                        ref={fileInputRef}
                                                        id="meal-image-input"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={onAddFiles}
                                                        className="hidden"
                                                    />
                                                    <label htmlFor="meal-image-input"
                                                           className="cursor-pointer inline-block">
                                                        <div
                                                            className="w-24 h-24 shrink-0 rounded-lg flex items-center justify-center text-secondary border-2 border-dashed">
                                                            <span className="text-2xl">+</span>
                                                        </div>
                                                    </label>
                                                </div>
                                                {images.map((src, idx) => (
                                                    <div key={idx} className="relative w-24 h-24">
                                                        <img src={src} alt={`manage-${idx}`}
                                                             className="w-24 h-24 object-cover rounded-md"/>
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <Button size="icon" variant="destructive"
                                                                    onClick={() => removeImage(idx)}>
                                                                <Trash/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 flex justify-end gap-2">
                                                <DialogClose asChild>
                                                    <Button>Fertig</Button>
                                                </DialogClose>
                                            </div>

                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
            </form>
        </div>
    )
}