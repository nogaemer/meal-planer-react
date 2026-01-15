/**
 * Authentication and user management type definitions.
 * Defines request/response interfaces for authentication flows and user data.
 */

/**
 * Credentials for standard username/password authentication.
 */
export interface AuthenticationRequest {
    /** Username or email for login */
    login: string | null;
    /** User password */
    password: string | null;
}

/**
 * User registration request with required fields and role.
 */
export interface RegisterRequest {
    /** Display name for the new user */
    name: string;
    /** Unique login identifier (username or email) */
    login: string;
    /** Password for the account */
    password: string;
    /** User role determining permissions */
    role: 'USER' | 'ADMIN' | 'MANAGER';
}

/**
 * JWT tokens and user ID returned after successful authentication.
 */
export interface AuthenticationResponse {
    /** Short-lived JWT for API requests */
    accessToken: string | null;
    /** Long-lived JWT for obtaining new access tokens */
    refreshToken: string | null;
    /** Unique identifier for the authenticated user */
    userId: string | null;
}

/**
 * Basic user information returned from API endpoints.
 */
export interface UserResponse {
    /** Unique user identifier */
    id: string;
    /** Display name */
    name: string;
}

/**
 * Authentication context interface providing auth state and methods throughout the app.
 * Used by AuthProvider and consumed via useAuth hook.
 */
export interface AuthContextType {
    /** Currently authenticated user, null if not logged in */
    user: UserResponse | null;
    /** Current JWT access token, null if not authenticated */
    accessToken: string | null;
    /** Whether a user is currently authenticated */
    isAuthenticated: boolean;
    /** Whether auth state is being initialized or refreshed */
    isLoading: boolean;
    /** Authenticate with username and password. Returns true on success. */
    login: (credentials: AuthenticationRequest) => Promise<boolean>;
    /** Redirect to OAuth2 provider (e.g., 'google', 'github') */
    oAuth2Login: (provider: string) => void;
    /** Register a new user account. Returns true on success. */
    register: (data: RegisterRequest) => Promise<boolean>;
    /** Clear auth state and tokens */
    logout: () => void;
    /** Refresh access token using refresh token. Returns true on success. */
    refreshToken: () => Promise<boolean>;
    /** Initialize auth state from stored tokens on app load */
    initializeAuth: () => Promise<void>;
}