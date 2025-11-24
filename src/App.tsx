import './App.css';
import {AuthProvider} from '@/contexts/auth-context.tsx';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

import HomePage from '@/pages/HomePage.tsx';
import DashboardPage from '@/pages/DashboardPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
import AuthCallbackPage from "@/pages/AuthCallbackPage.tsx";
import {MealPage} from "./pages/MealPage";
import {ThemeProvider} from "@/contexts/theme-provider.tsx";
import {MealEditPage} from "@/pages/MealEditPage.tsx";

function App() {

    return (
        <AuthProvider>
            <ThemeProvider storageKey="app-theme" defaultTheme="system">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/auth/callback" element={<AuthCallbackPage/>}/>
                        <Route element={<ProtectedRoute/>}>
                            <Route path="/dashboard" element={<DashboardPage/>}/>
                            <Route path="/meal/:id" element={<MealPage/>}/>
                            <Route path="/meal/:id/edit" element={<MealEditPage/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
