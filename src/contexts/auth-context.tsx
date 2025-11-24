// contexts/AuthContext.tsx
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

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!accessToken;

    // Initialize auth state
    useEffect(() => {
        initializeAuth();
    }, []);

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

    // Set up HTTP client callbacks
    useEffect(() => {
        httpClient.setCallbacks(
            (tokens: AuthenticationResponse) => {
                setAccessToken(tokens.accessToken);
            },
            () => {
                logout();
            }
        );
    }, []);

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

    const oAuth2Login = async (provider: string) => {
        await authService.oAuthLogin(provider);
    }

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

    const logout = (): void => {
        httpClient.setTokens(null, null);
        setAccessToken(null);
        setUser(null);
    };

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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};