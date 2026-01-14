import './App.css';
import {AuthProvider} from '@/contexts/auth-context.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

import {ThemeProvider} from "@/contexts/theme-provider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

import MainLayout from "@/components/MainLayout";
import {Suspense, lazy} from "react";
import {Spinner} from "@/components/ui/spinner.tsx";

const HomePage = lazy(() => import('@/pages/HomePage.tsx'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage.tsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage.tsx'));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage.tsx"));
const MealPage = lazy(() => import("./pages/MealPage").then(module => ({ default: module.MealPage })));
const MealEditPage = lazy(() => import("@/pages/MealEditPage.tsx").then(module => ({ default: module.MealEditPage })));
const MealCreatePage = lazy(() => import("@/pages/MealCreatePage.tsx").then(module => ({ default: module.MealCreatePage })));

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Spinner /></div>}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/auth/callback" element={<AuthCallbackPage />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>

                                <Route element={<MainLayout />}>
                                    <Route path="/dashboard" element={<DashboardPage/>}/>
                                    <Route path="/meal/:id" element={<MealPage/>}/>
                                    <Route path="/meal/:id/edit" element={<MealEditPage/>}/>
                                    <Route path="/meal/new" element={<MealCreatePage/>}/>
                                </Route>

                            </Route>
                        </Routes>
                    </Suspense>
                    <Toaster />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

