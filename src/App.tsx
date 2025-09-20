import './App.css';
import { AuthProvider } from '@/contexts/AuthContext.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute.tsx";

// Example pages
import HomePage from '@/pages/HomePage.tsx';
import DashboardPage from '@/pages/DashboardPage.tsx';
import LoginPage from '@/pages/LoginPage.tsx';
import AuthCallbackPage from "@/pages/AuthCallbackPage.tsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/test" element={<DashboardPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
