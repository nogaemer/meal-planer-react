import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.ts";

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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
            
        } else navigate("/login");
        
        if (isAuthenticated) navigate("/dashboard");
        
    }, [isAuthenticated, navigate]);

    return <div>Authenticating...</div>;
};

export default AuthCallbackPage;
