/**
 * AuthCallbackPage - OAuth2 callback handler that processes authentication tokens and redirects
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

/**
 * AuthCallbackPage component - Handles OAuth2 authentication callback
 * 
 * Processes URL query parameters containing authentication tokens from OAuth2 providers.
 * Extracts and stores access token, refresh token, and userId in localStorage.
 * Initializes auth state and redirects to dashboard on success, or back to login on failure.
 * 
 * @returns Loading spinner while processing authentication
 */
const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, initializeAuth } = useAuth();

    // Process OAuth2 callback parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        const accessToken = params.get("token");
        const refreshTokenValue = params.get("refreshToken");
        const userId = params.get("userId");
        console.log(type, accessToken, refreshTokenValue, userId);

        // Success path - store tokens and initialize auth
        if (type === "success" && accessToken && refreshTokenValue && userId) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshTokenValue);
            localStorage.setItem("userId", userId);
            initializeAuth()
                .then(() => navigate("/dashboard"))
                .catch((error) => {
                    console.error("Failed to initialize authentication:", error);
                    window.alert("Authentication failed. Please log in again.");
                    navigate("/login");
                });
        } else if (type === "failure" || !isAuthenticated) {
            // Failure path - redirect to login
            console.error("Authentication failed. Please log in again.");
            navigate("/login");
        }

        // Fallback redirect for already authenticated users
        if (isAuthenticated) navigate("/dashboard");

    }, [initializeAuth, isAuthenticated, navigate]);

    return<div className="flex h-screen w-full items-center justify-center"><Spinner /></div>
};

export default AuthCallbackPage;
