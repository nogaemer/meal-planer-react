import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, initializeAuth } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type");
        const accessToken = params.get("token");
        const refreshTokenValue = params.get("refreshToken");
        const userId = params.get("userId");
        console.log(type, accessToken, refreshTokenValue, userId);

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
            console.error("Authentication failed. Please log in again.");
            navigate("/login");
        }

        if (isAuthenticated) navigate("/dashboard");

    }, [initializeAuth, isAuthenticated, navigate]);

    return<div className="flex h-screen w-full items-center justify-center"><Spinner /></div>
};

export default AuthCallbackPage;
