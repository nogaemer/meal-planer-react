/**
 * HTTP client with JWT authentication, token refresh, and automatic retry.
 * Wraps fetch API with interceptors for authorization and error handling.
 */
import type {AuthenticationResponse} from '../types/auth';

/**
 * HTTP client for API communication with token management.
 * Handles authentication, token refresh, and request/response processing.
 */
export class HttpClient {
    private baseURL: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    /** Callback invoked when tokens are refreshed successfully */
    private onTokenRefresh?: (tokens: AuthenticationResponse) => void;
    /** Callback invoked when authentication fails (e.g., refresh fails) */
    private onAuthError?: () => void;

    /**
     * Create HTTP client with base URL from environment or parameter.
     * @param baseURL - Optional base URL, falls back to VITE_SPRING_APP_API_URL env var.
     * @throws Error if no base URL is configured.
     */
    constructor(baseURL?: string) {
        if (baseURL !== undefined && baseURL !== null) {
            this.baseURL = baseURL;
        } else if (import.meta.env.VITE_SPRING_APP_API_URL) {
            this.baseURL = import.meta.env.VITE_SPRING_APP_API_URL;
        } else {
            throw new Error('VITE_SPRING_APP_API_URL environment variable is not defined. Please set it in your environment.');
        }
        this.loadTokensFromStorage();
    }

    /**
     * Set JWT tokens for authentication and persist to localStorage.
     * Pass null to clear tokens (logout).
     * 
     * @param accessToken - JWT access token for API requests.
     * @param refreshToken - JWT refresh token for obtaining new access tokens.
     */
    setTokens(accessToken: string | null, refreshToken: string | null): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    /**
     * Register callbacks for token refresh and auth errors.
     * 
     * @param onTokenRefresh - Called when tokens are successfully refreshed.
     * @param onAuthError - Called when auth fails (e.g., refresh token expired).
     */
    setCallbacks(
        onTokenRefresh: (tokens: AuthenticationResponse) => void,
        onAuthError: () => void
    ): void {
        this.onTokenRefresh = onTokenRefresh;
        this.onAuthError = onAuthError;
    }

    /**
     * Load tokens from localStorage on client initialization.
     */
    private loadTokensFromStorage(): void {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    /**
     * Attempt to refresh the access token using the refresh token.
     * 
     * @returns True if refresh succeeded, false otherwise.
     */
    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${this.baseURL}/api/v1/auth/refresh-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.refreshToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const tokens: AuthenticationResponse = await response.json();
                this.setTokens(tokens.accessToken, tokens.refreshToken);
                this.onTokenRefresh?.(tokens);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        this.onAuthError?.();
        return false;
    }

    /**
     * Make an HTTP request with automatic authentication and token refresh.
     * Automatically retries once with refreshed token on 401 response.
     * 
     * @param endpoint - API endpoint path (e.g., '/api/v1/meals').
     * @param options - Fetch options (method, body, headers, etc.).
     * @returns Parsed JSON response or text if non-JSON.
     * @throws Error if request fails or returns non-2xx status.
     */
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.accessToken) {
            headers.Authorization = `Bearer ${this.accessToken}`;
        }

        let response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && this.accessToken) {
            const refreshed = await this.refreshAccessToken();

            if (refreshed) {
                // Retry the original request with new token
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            }
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text() as T;
    }

    // Convenience methods for common HTTP verbs
    
    /**
     * GET request shorthand.
     * @param endpoint - API endpoint path.
     * @returns Parsed response.
     */
    get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST request shorthand with JSON body.
     * @param endpoint - API endpoint path.
     * @param data - Request body (will be JSON stringified).
     * @returns Parsed response.
     */
    post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request shorthand with JSON body.
     * @param endpoint - API endpoint path.
     * @param data - Request body (will be JSON stringified).
     * @returns Parsed response.
     */
    put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request shorthand.
     * @param endpoint - API endpoint path.
     * @returns Parsed response.
     */
    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request shorthand with JSON body.
     * @param endpoint - API endpoint path.
     * @param data - Request body (will be JSON stringified).
     * @returns Parsed response.
     */
    patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

/** Singleton HTTP client instance used throughout the application. */
export const httpClient = new HttpClient();
