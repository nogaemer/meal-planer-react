/**
 * ProtectedRoute.tsx - Authentication guard for protected application routes
 */

import React from "react";
import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth.ts";

/**
 * ProtectedRoute component that guards routes requiring authentication
 * 
 * This component checks the user's authentication status and either:
 * - Displays a loading state while authentication is being verified
 * - Redirects to the login page if the user is not authenticated
 * - Renders the child routes (via Outlet) if the user is authenticated
 * 
 * @returns {JSX.Element} Loading state, redirect to login, or protected route content
 * 
 * @example
 * // In router configuration:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/settings" element={<Settings />} />
 * </Route>
 */
const ProtectedRoute: React.FC = () => {
    const {isAuthenticated, isLoading} = useAuth();

    // Display loading state while checking authentication status
    if (isLoading) return (
        <div className="flex items-center w-full h-full gap-4">
        </div>
    )

    // Redirect to login page if user is not authenticated
    if (!isAuthenticated) return <Navigate to="/login" replace/>;

    // Render child routes if authenticated
    return <Outlet/>;
};

export default ProtectedRoute;
