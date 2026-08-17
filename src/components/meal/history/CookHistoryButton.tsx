/**
 * Button for viewing cooking history of a meal.
 * Shows history icon and optional last cooked date.
 */
import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { History } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface CookHistoryButtonProps {
    /** Callback when button is clicked */
    onClick: () => void;
    /** Optional last cooked timestamp for tooltip */
    lastCookedAt?: string;
    /** Optional variant for button style */
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    /** Optional size */
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * CookHistoryButton - Button to open cooking history modal
 * 
 * Features:
 * - History icon
 * - Tooltip with last cooked info
 * - Configurable style
 * 
 * @param onClick - Click handler
 * @param lastCookedAt - Optional last cooked timestamp
 * @param variant - Button variant
 * @param size - Button size
 */
export const CookHistoryButton: React.FC<CookHistoryButtonProps> = ({
    onClick,
    lastCookedAt,
    variant = 'outline',
    size = 'default',
}) => {
    // Format relative time for tooltip
    const getTooltipText = () => {
        if (!lastCookedAt) {
            return 'View cooking history';
        }

        try {
            const relativeTime = formatDistanceToNow(parseISO(lastCookedAt), {
                addSuffix: true,
            });
            return `Last cooked: ${relativeTime}`;
        } catch {
            return 'View cooking history';
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        variant={variant}
                        size={size}
                        className="gap-2"
                    >
                        <History className="h-4 w-4" />
                        {size !== 'icon' && 'History'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{getTooltipText()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
