/**
 * Authentication context provider managing user auth state, login, and token refresh.
 * Wraps the application to provide authentication throughout the component tree.
 */
import React, {useEffect, useState, type ReactNode } from 'react';
import { httpClient } from '../services/httpClient';
import { authService } from '../services/authService';
import type {
    AuthContextType,
    AuthenticationRequest,
    RegisterRequest,
    UserResponse,
    AuthenticationResponse,
} from '../types/auth';
import { AuthContext } from '@/hooks/useAuth';

/**
 * Props for AuthProvider component.
 */
interface AuthProviderProps {
    /** Child components to wrap with auth context */
    children: ReactNode;
}

/**
 * Authentication provider component managing auth state and operations.
 * Initializes auth from stored tokens, handles login/logout, and token refresh.
 * 
 * @param props.children - Application content to wrap with auth context.
 * @returns Provider component wrapping children with authentication context.
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!accessToken;

    // Initialize auth state on mount from stored tokens
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication from localStorage tokens.
     * Attempts to fetch current user if tokens exist.
     */
    const initializeAuth = async (): Promise<void> => {
        setIsLoading(true);

        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedAccessToken && storedRefreshToken) {
            httpClient.setTokens(storedAccessToken, storedRefreshToken);
            setAccessToken(storedAccessToken);

            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to get current user:', error);
                logout();
            }
        }

        setIsLoading(false);
    };

    // Set up HTTP client callbacks for token refresh and auth errors
    useEffect(() => {
        httpClient.setCallbacks(
            // On token refresh, update access token in state
            (tokens: AuthenticationResponse) => {
                setAccessToken(tokens.accessToken);
            },
            // On auth error (e.g., refresh fails), logout user
            () => {
                logout();
            }
        );
    }, []);

    /**
     * Authenticate user with credentials.
     * On success, stores tokens and fetches user profile.
     * 
     * @param credentials - Username/email and password.
     * @returns True if login succeeded, false otherwise.
     */
    const login = async (credentials: AuthenticationRequest): Promise<boolean> => {
        try {
            const response = await authService.login(credentials);
            console.log(response);

            if (response.accessToken && response.refreshToken) {
                httpClient.setTokens(response.accessToken, response.refreshToken);
                setAccessToken(response.accessToken);

                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    /**
     * Initiate OAuth2 login flow by redirecting to provider.
     * 
     * @param provider - OAuth provider identifier (e.g., 'google', 'github').
     */
    const oAuth2Login = async (provider: string) => {
        await authService.oAuthLogin(provider);
    }

    /**
     * Register a new user and automatically log them in.
     * 
     * @param data - Registration data (name, login, password, role).
     * @returns True if registration succeeded, false otherwise.
     */
    const register = async (data: RegisterRequest): Promise<boolean> => {
        try {
            const response = await authService.register(data);

            if (response.accessToken && response.refreshToken) {
                httpClient.setTokens(response.accessToken, response.refreshToken);
                setAccessToken(response.accessToken);

                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);

                return true;
            }

            return false;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    };

    /**
     * Log out the current user and clear all auth state.
     */
    const logout = (): void => {
        httpClient.setTokens(null, null);
        setAccessToken(null);
        setUser(null);
    };

    /**
     * Manually refresh the access token.
     * Note: This is handled automatically by httpClient; rarely needed directly.
     * 
     * @returns True if refresh succeeded, false otherwise.
     */
    const refreshToken = async (): Promise<boolean> => {
        try {
            const response = await authService.refreshToken();

            if (response.accessToken && response.refreshToken) {
                httpClient.setTokens(response.accessToken, response.refreshToken);
                setAccessToken(response.accessToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    };

    const value: AuthContextType = {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        oAuth2Login,
        register,
        logout,
        refreshToken,
        initializeAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};