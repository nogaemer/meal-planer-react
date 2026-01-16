/**
 * Authentication service providing login, registration, and user management.
 * Wraps authentication API endpoints using the HTTP client.
 */
import { httpClient } from './httpClient';
import type {
    AuthenticationRequest,
    RegisterRequest,
    AuthenticationResponse,
    UserResponse,
} from '../types/auth';

/**
 * Service for authentication operations including login, registration, and OAuth.
 */
export class AuthService {
    /**
     * Authenticate with username and password.
     * 
     * @param credentials - Login credentials (username/email and password).
     * @returns Authentication response with tokens and user ID.
     */
    async login(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
        return httpClient.post<AuthenticationResponse>('/api/v1/auth/authenticate', credentials);
    }

    /**
     * Initiate OAuth2 login by redirecting to provider.
     * Window will redirect to provider's login page.
     * 
     * @param provider - OAuth provider name (e.g., 'google', 'github').
     */
    async oAuthLogin(provider: string) {
        window.location.href = `${import.meta.env.VITE_SPRING_APP_API_URL}/api/v1/auth/login/${provider}`;
    }

    /**
     * Register a new user account.
     * 
     * @param data - Registration details (name, login, password, role).
     * @returns Authentication response with tokens for the new user.
     */
    async register(data: RegisterRequest): Promise<AuthenticationResponse> {
        return httpClient.post<AuthenticationResponse>('/api/v1/auth/register', data);
    }

    /**
     * Fetch the currently authenticated user's profile.
     * 
     * @returns User profile data.
     */
    async getCurrentUser(): Promise<UserResponse> {
        return httpClient.get<UserResponse>('/api/v1/users/me');
    }

    /**
     * Refresh authentication tokens using the refresh token.
     * Note: httpClient handles this internally; this method is rarely called directly.
     * 
     * @returns New authentication tokens.
     */
    async refreshToken(): Promise<AuthenticationResponse> {
        return httpClient.get<AuthenticationResponse>('/api/v1/auth/refresh-token');
    }
}

/** Singleton auth service instance used throughout the application. */
export const authService = new AuthService();
