// services/authService.ts
import { httpClient } from './httpClient';
import type {
    AuthenticationRequest,
    RegisterRequest,
    AuthenticationResponse,
    UserResponse,
} from '../types/auth';

export class AuthService {
    async login(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
        return httpClient.post<AuthenticationResponse>('/api/v1/auth/authenticate', credentials);
    }

    async oAuthLogin(provider: string) {
        window.location.href = `http://localhost:8080/api/v1/auth/login/${provider}`;
    }

    async register(data: RegisterRequest): Promise<AuthenticationResponse> {
        return httpClient.post<AuthenticationResponse>('/api/v1/auth/register', data);
    }

    async getCurrentUser(): Promise<UserResponse> {
        return httpClient.get<UserResponse>('/api/v1/users/me');
    }

    async refreshToken(): Promise<AuthenticationResponse> {
        return httpClient.get<AuthenticationResponse>('/api/v1/auth/refresh-token');
    }
}

export const authService = new AuthService();
