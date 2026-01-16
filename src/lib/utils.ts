/**
 * Utility functions for Tailwind CSS class management.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 * 
 * @param inputs - Class values (strings, objects, arrays) to merge.
 * @returns Merged class string with Tailwind conflicts resolved.
 * 
 * @example
 * cn("px-4 py-2", "px-6") // "py-2 px-6" (px-4 overridden)
 * cn("text-red-500", condition && "text-blue-500") // Conditional class
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
