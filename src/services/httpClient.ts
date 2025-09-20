// services/httpClient.ts
// services/httpClient.ts
import type {AuthenticationResponse} from '../types/auth';

export class HttpClient {
    private baseURL: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private onTokenRefresh?: (tokens: AuthenticationResponse) => void;
    private onAuthError?: () => void;

    constructor(baseURL: string = 'http://localhost:8080') {
        this.baseURL = baseURL;
        this.loadTokensFromStorage();
    }

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

    setCallbacks(
        onTokenRefresh: (tokens: AuthenticationResponse) => void,
        onAuthError: () => void
    ): void {
        this.onTokenRefresh = onTokenRefresh;
        this.onAuthError = onAuthError;
    }

    private loadTokensFromStorage(): void {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

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

    // Convenience methods
    get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

export const httpClient = new HttpClient();
