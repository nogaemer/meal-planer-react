import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import {useAuth} from "@/hooks/useAuth.ts";
import {Spinner} from "@/components/ui/spinner.tsx";

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return (
        <div className="flex items-center w-full h-full gap-4">
            <Spinner />
        </div>
    )

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
