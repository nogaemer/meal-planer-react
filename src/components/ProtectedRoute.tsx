import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import {useAuth} from "@/hooks/useAuth.ts";

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

        if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
