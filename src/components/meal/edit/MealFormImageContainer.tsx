/**
 * Image management component with upload, preview, and deletion functionality.
 */

import {FieldGroup, FieldLegend, FieldSet} from "@/components/ui/field.tsx";
import {type ChangeEvent, useEffect, useRef, useState} from "react";
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
import type {Image} from "@/types/meal.ts";
import {httpClient} from "@/services/httpClient.ts";

interface MealFormImageContainerProps {
    images: Image[];
    onChange: (next: Image[]) => void;
}

/**
 * Image container for meal form with thumbnail carousel, main preview, and upload dialog.
 * Handles file upload with Base64 encoding and image deletion via delete URLs.
 * 
 * @param images - Array of meal images with srcSet and thumbnail URLs
 * @param onChange - Callback to update parent with new image array
 * @returns Image preview carousel, main display, and management dialog
 */
export const MealFormImageContainer = ({images, onChange}: MealFormImageContainerProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [thumbLoaded, setThumbLoaded] = useState<Record<number, boolean>>({});

    // Adjust selected index if it's out of bounds after image deletion
    useEffect(() => {
        if (selectedIndex >= images.length) {
            setSelectedIndex(Math.max(0, images.length - 1));
        }
    }, [images, selectedIndex]);
    /** Converts a File object to Base64 string for API upload */
    async function fileToBase64String(file: File): Promise<string> {
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64 = dataUrl.split(',')[1] ?? "";
                resolve(base64);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    /** Uploads selected files to server and adds them to the image list */
    const onAddFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Convert all files to Base64
        const base64s = await Promise.all(Array.from(files).map(fileToBase64String));
        const uploaded: Image[] = [];
        
        // Upload each image to the server
        for (const data of base64s) {
            const image = await httpClient.post<Image>(`/api/v1/images/upload`, {base64: data});
            uploaded.push(image);
        }

        onChange([...images, ...uploaded]);
        setSelectedIndex(images.length);
        e.currentTarget.value = "";
    };


    /** Removes an image and calls its delete URLs for cleanup */
    const removeImage = (index: number) => {
        // Call delete URLs to clean up server-side resources
        images[index].deleteUrls?.forEach(
            async (url) => await fetch(url)
        )
        const next = images.filter((_, i) => i !== index);
        onChange(next);
        if (selectedIndex >= next.length) {
            setSelectedIndex(Math.max(0, next.length - 1));
        }
    }

    return (
        <div className="w-full bg-card p-6 rounded-3xl h-fit">
            <form>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Bilder</FieldLegend>
                        <FieldGroup>
                            <div className="w-full">
                                {/* Main image preview */}
                                <div className="mb-4 w-full rounded-xl overflow-hidden">
                                    {images && images.length > 0 ? (
                                        <img
                                            src={images[selectedIndex].srcSetArray[images[selectedIndex].srcSetArray.length - 1]}
                                            srcSet={images[selectedIndex].srcSetString}
                                            alt={`Bild ${selectedIndex + 1}`}
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
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

                                {/* Thumbnail carousel with horizontal scroll */}
                                <div className="flex items-center gap-3">
                                    {images.length > 0 && <div
                                        className="flex gap-3 overflow-x-auto overflow-y-hidden rounded-lg"
                                        onWheel={(e) => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            // Enable vertical scroll wheel to scroll horizontally
                                            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                                                el.scrollBy({left: e.deltaY!, behavior: "smooth"});
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        {images.map((image, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedIndex(idx)}
                                                className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border ${selectedIndex === idx ? 'border-primary' : 'border-transparent'} p-0`}
                                            >
                                                <div className="w-full h-full relative">
                                                    {/* Loading spinner while thumbnail loads */}
                                                    {!thumbLoaded[idx] && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center bg-white/30">
                                                            <svg className="w-6 h-6 animate-spin text-primary"
                                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                        strokeWidth="4"></circle>
                                                                <path className="opacity-75"
                                                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                      strokeWidth="4"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <img
                                                        src={image.thumbnail}
                                                        alt={`thumb-${idx}`}
                                                        onLoad={() => setThumbLoaded(prev => ({...prev, [idx]: true}))}
                                                        onError={() => setThumbLoaded(prev => ({...prev, [idx]: true}))}
                                                        className="w-full h-full object-cover"
                                                        aria-busy={!thumbLoaded[idx]}
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </div>}

                                    {/* Add button to open management dialog */}
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

                                            {/* Image grid in dialog for upload and deletion */}
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
                                                {images.map((image, idx) => (
                                                    <div key={idx} className="relative w-24 h-24">
                                                        <img src={image.thumbnail} alt={`manage-${idx}`}
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