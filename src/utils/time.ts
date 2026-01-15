/**
 * Time formatting utilities for displaying durations in human-readable format.
 */

/**
 * Format a duration in minutes to a human-readable string with days, hours, and minutes.
 * 
 * @param minutes - Total duration in minutes.
 * @returns Formatted string like "2d 3h 45m" or "30m". Returns "0m" if minutes is 0.
 * 
 * @example
 * formatMinutes(75) // "1h 15m"
 * formatMinutes(1500) // "1d 1h"
 */
export function formatMinutes(minutes: number): string {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    
    // Build array of non-zero time components
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    
    return parts.length > 0 ? parts.join(' ') : '0m';
}