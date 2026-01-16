/**
 * Theme provider for managing dark/light/system theme preferences.
 * Handles theme state, persistence, and applying theme classes to the DOM.
 */
import {createContext, useEffect, useState} from "react"

/** Available theme options */
type Theme = "dark" | "light" | "system"

/**
 * Props for ThemeProvider component.
 */
type ThemeProviderProps = {
    /** Child components to wrap with theme context */
    children: React.ReactNode
    /** Initial theme if no stored preference exists */
    defaultTheme?: Theme
    /** localStorage key for persisting theme preference */
    storageKey?: string
}

/**
 * Theme context state interface.
 */
type ThemeProviderState = {
    /** Current theme setting */
    theme: Theme
    /** Function to update theme and persist to storage */
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

/** Theme context for accessing theme state throughout the app */
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)
export default ThemeProviderContext

/**
 * Theme provider component managing theme state and DOM updates.
 * Applies theme classes to document root and syncs with system preferences.
 * 
 * @param props.children - Application content to wrap with theme context.
 * @param props.defaultTheme - Default theme if no stored preference (default: "system").
 * @param props.storageKey - localStorage key for theme persistence (default: "vite-ui-theme").
 * @returns Provider component wrapping children with theme context.
 * 
 * @example
 * <ThemeProvider defaultTheme="dark" storageKey="app-theme">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    // Initialize theme from localStorage or use default
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    // Apply theme class to document root whenever theme changes
    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        // If system theme, detect OS preference
        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        // Persist theme to localStorage when changed
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}