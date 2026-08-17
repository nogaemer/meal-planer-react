/**
 * Root application component with routing, authentication, and theme providers.
 * Configures React Router with public and protected routes, lazy-loaded pages for code splitting.
 */
import './App.css';
import {AuthProvider} from '@/contexts/auth-context.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

import {ThemeProvider} from "@/contexts/theme-provider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

import MainLayout from "@/components/MainLayout";
import {Suspense, lazy} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";

// Lazy-load page components for code splitting
const HomePage = lazy(() => import('@/pages/HomePage.tsx'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage.tsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage.tsx'));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage.tsx"));
const HistoryPage = lazy(() => import('@/pages/HistoryPage.tsx'));
const MealPage = lazy(() => import("./pages/MealPage").then(module => ({ default: module.MealPage })));
const MealEditPage = lazy(() => import("@/pages/MealEditPage.tsx").then(module => ({ default: module.MealEditPage })));
const MealCreatePage = lazy(() => import("@/pages/MealCreatePage.tsx").then(module => ({ default: module.MealCreatePage })));

/**
 * Main App component - sets up providers and routing.
 * 
 * Structure:
 * - ThemeProvider: Manages dark/light theme
 * - AuthProvider: Manages authentication state
 * - BrowserRouter: Client-side routing
 * - Suspense: Shows spinner while lazy-loading pages
 * - Routes: Public routes (/login, /auth/callback) and protected routes (dashboard, meals)
 * - Toaster: Global toast notifications
 * 
 * @returns Configured application with routing and providers.
 */
function App() {
    return (
        <ThemeProvider storageKey="vite-ui-theme">
            <AuthProvider>
                <BrowserRouter>
                    {/* Show spinner while lazy components load */}
                    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner /></div>}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/auth/callback" element={<AuthCallbackPage />} />

                            {/* Protected routes - require authentication */}
                            <Route element={<ProtectedRoute />}>
                                {/* Routes with MainLayout (navbar, etc.) */}
                                <Route element={<MainLayout />}>
                                    <Route path="/dashboard" element={<DashboardPage/>}/>
                                    <Route path="/history" element={<HistoryPage/>}/>
                                    <Route path="/meal/:id" element={<MealPage/>}/>
                                    <Route path="/meal/:id/edit" element={<MealEditPage/>}/>
                                    <Route path="/meal/new" element={<MealCreatePage/>}/>
                                </Route>

                            </Route>
                        </Routes>
                    </Suspense>
                    {/* Global toast notification container */}
                    <Toaster />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
