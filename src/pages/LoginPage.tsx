/**
 * LoginPage - User authentication page with email/password and OAuth2 login options
 */

import {LoginForm} from "@/components/login-form.tsx";
import React, {useEffect} from "react";
import {Salad} from "lucide-react";
import {useAuth} from "@/hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";

/**
 * LoginPage component - Handles user authentication with multiple login methods
 * 
 * Provides login form with email/password authentication and OAuth2 provider support.
 * Automatically redirects authenticated users to the dashboard.
 * 
 * @returns Login page with branding and authentication form
 */
const LoginPage: React.FC = () => {
    const {login, oAuth2Login, isAuthenticated} = useAuth();
    const navigate = useNavigate()

    /**
     * Handles traditional email/password login form submission
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const success = await login({login: email, password});
        console.log(success);
    }

    /**
     * Initiates OAuth2 authentication flow with the specified provider
     */
    const handleOAuth2Login = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, provider: string) => {
        event.preventDefault()
        oAuth2Login(provider);
    }

    // Redirect already authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated){
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <Salad className="size-4"/>
                    </div>
                    <p className={"text-foreground"}>Meal Planer</p>
                </a>
                <LoginForm handleSubmit={handleSubmit} handleOAuth2Login={handleOAuth2Login} />
            </div>
        </div>
    )
}

export default LoginPage;