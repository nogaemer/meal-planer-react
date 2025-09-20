// types/auth.ts

export interface AuthenticationRequest {
    login: string | null;
    password: string | null;
}

export interface RegisterRequest {
    name: string;
    login: string;
    password: string;
    role: 'USER' | 'ADMIN' | 'MANAGER';
}

export interface AuthenticationResponse {
    accessToken: string | null;
    refreshToken: string | null;
    userId: string | null;
}

export interface UserResponse {
    id: string;
    name: string;
}

export interface AuthContextType {
    user: UserResponse | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: AuthenticationRequest) => Promise<boolean>;
    oAuth2Login: (provider: string) => void;
    register: (data: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
}