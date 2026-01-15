/**
 * Authentication hook for accessing auth context throughout the app.
 */
import type {AuthContextType} from "@/types/auth.ts";
import {createContext, useContext} from "react";

/** React context for authentication state and methods. */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context.
 * Provides current user, auth state, and auth methods.
 * 
 * @returns Authentication context with user, tokens, and auth methods.
 * @throws Error if used outside AuthProvider.
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 * if (isAuthenticated) { ... }
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
