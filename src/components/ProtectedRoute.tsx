import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth.ts";

const ProtectedRoute: React.FC = () => {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) return (
        <div className="flex items-center w-full h-full gap-4">
        </div>
    )

    if (!isAuthenticated) return <Navigate to="/login" replace/>;

    return <Outlet/>;
};

export default ProtectedRoute;
