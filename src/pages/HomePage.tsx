import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Calendar, ShoppingCart, Star } from "lucide-react";

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6 lg:px-8 text-center space-y-6 max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Plan Your Meals with Ease
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Organize your weekly meal plans, discover new recipes, and generate shopping lists automatically.
                        Healthy eating made simple.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button size="lg" onClick={() => navigate("/dashboard")}>
                            Get Started
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                            Log In
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 bg-muted/50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Meal Planer?</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard
                                icon={<Calendar className="h-10 w-10 text-primary" />}
                                title="Weekly Planning"
                                description="Drag and drop meals to plan your week in minutes."
                            />
                            <FeatureCard
                                icon={<ChefHat className="h-10 w-10 text-primary" />}
                                title="Recipe Management"
                                description="Store all your favorite recipes in one place with detailed instructions."
                            />
                            <FeatureCard
                                icon={<ShoppingCart className="h-10 w-10 text-primary" />}
                                title="Smart Shopping Lists"
                                description="Automatically generate shopping lists based on your meal plan."
                            />
                            <FeatureCard
                                icon={<Star className="h-10 w-10 text-primary" />}
                                title="Discover & Rate"
                                description="Find new inspiration and rate meals to keep track of favorites."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-6 border-t text-center text-sm text-muted-foreground">
                <div className="max-w-6xl mx-auto px-4">
                    <p>© {new Date().getFullYear()} Meal Planer. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="border-none shadow-md bg-background">
        <CardHeader className="flex flex-col items-center text-center pb-2">
            <div className="mb-4 p-3 bg-primary/10 rounded-full">
                {icon}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
            {description}
        </CardContent>
    </Card>
);

export default HomePage;