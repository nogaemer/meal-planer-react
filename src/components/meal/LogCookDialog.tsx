/**
 * Dialog for logging a cooked meal with rating, portion size, and notes.
 */
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Star } from 'lucide-react';
import { historyService } from '@/services/historyService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogCookDialogProps {
    /** Whether dialog is open */
    isOpen: boolean;
    /** Callback to close dialog */
    onClose: () => void;
    /** ID of meal being logged */
    mealId: string;
    /** Name of meal being logged */
    mealName: string;
    /** Callback after successful logging */
    onSuccess: () => void;
}

/**
 * LogCookDialog - Form dialog for logging that a meal was cooked
 * 
 * Features:
 * - Star rating (1-5)
 * - Portion size selection
 * - Optional notes
 * - Form validation and submission
 * - Success/error toast notifications
 * 
 * @param isOpen - Dialog open state
 * @param onClose - Close dialog callback
 * @param mealId - Meal identifier
 * @param mealName - Meal name for display
 * @param onSuccess - Callback after successful log
 */
export const LogCookDialog: React.FC<LogCookDialogProps> = ({
    isOpen,
    onClose,
    mealId,
    mealName,
    onSuccess,
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [portionSize, setPortionSize] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog closes
    const handleClose = () => {
        setRating(0);
        setHoverRating(0);
        setPortionSize('');
        setNotes('');
        onClose();
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            // Parse portion size
            let portion: number | undefined;
            if (portionSize && portionSize !== 'custom') {
                const sizeMap: Record<string, number> = {
                    small: 1,
                    medium: 2,
                    large: 3,
                };
                portion = sizeMap[portionSize];
            }

            // Log the meal
            await historyService.logMealCooked(
                mealId,
                portion,
                rating > 0 ? rating : undefined,
                notes || undefined
            );

            toast.success(`${mealName} logged successfully! 🎉`);
            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error('Error logging meal:', err);
            toast.error(err?.message || 'Failed to log meal');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Log Cooked Meal</DialogTitle>
                        <DialogDescription>
                            Record that you cooked {mealName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Rating */}
                        <div className="space-y-2">
                            <Label htmlFor="rating">Rating (optional)</Label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const filled = star <= (hoverRating || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    'h-8 w-8 transition-colors',
                                                    filled
                                                        ? 'fill-yellow-500 text-yellow-500'
                                                        : 'text-muted-foreground'
                                                )}
                                            />
                                        </button>
                                    );
                                })}
                                {rating > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setRating(0)}
                                        className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Portion Size */}
                        <div className="space-y-2">
                            <Label htmlFor="portion">Portion Size (optional)</Label>
                            <Select value={portionSize} onValueChange={setPortionSize}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select portion size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small (1 serving)</SelectItem>
                                    <SelectItem value="medium">Medium (2 servings)</SelectItem>
                                    <SelectItem value="large">Large (3+ servings)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any notes about cooking this meal..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging...' : 'Log Meal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
