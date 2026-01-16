/**
 * Theme hook for accessing theme context and toggling between light/dark modes.
 */
import {useContext} from "react";
import ThemeProviderContext from "@/contexts/theme-provider.tsx";

/**
 * Hook to access theme context.
 * Provides current theme and setTheme function for theme switching.
 * 
 * @returns Theme context with theme state and setter.
 * @throws Error if used outside ThemeProvider.
 * 
 * @example
 * const { theme, setTheme } = useTheme();
 * setTheme("dark");
 */
export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}