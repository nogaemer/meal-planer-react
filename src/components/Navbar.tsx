import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {Search as SearchIcon, X as XIcon, Home, Grid, Plus, Settings} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import {Separator} from "@/components/ui/separator.tsx";

const Navbar: React.FC = () => {
    const {user, logout, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    const initials = (user?.name ?? "U").split(" ").map(s => s[0]).slice(0, 2).join("");

    // Controlled open state so we can close the sheet when a link/button is clicked
    const [open, setOpen] = React.useState(false);

    // Search state for the mobile sheet (UI/UX improvements: clear button, suggestions placeholder)
    const [query, setQuery] = React.useState("");

    // lightweight suggestions for better UX (could be replaced with real API results)
    const suggestions = React.useMemo(() => {
        if (!query) return ["Pasta", "Couscous-Salat", "Chicken Curry"];
        const q = query.toLowerCase();
        return ["Pasta", "Couscous-Salat", "Chicken Curry"].filter(s => s.toLowerCase().includes(q));
    }, [query]);

    return (
        <header className="w-full border-b bg-background/80 backdrop-blur-lg dark:bg-background/80 z-40 sticky top-0">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/vite.svg" alt="logo" className="h-8 w-8"/>
                        <span className="font-medium text-lg">Meal Planer</span>
                    </Link>
                </div>

                {/* Desktop search - visible on md and up */}
                <div className="hidden md:flex flex-1 items-center max-w-2xl">
                    <Input
                        placeholder="Search meals, tags, ingredients..."
                        className="mr-3 h-9"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                navigate(`/dashboard?q=${encodeURIComponent(query)}`);
                            }
                        }}
                    />
                    <Button variant="outline" onClick={() => navigate(`/dashboard?q=${encodeURIComponent(query)}`)}>
                        Search
                    </Button>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    {/* Mobile: hamburger to open sheet */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="md:hidden" aria-label="Open menu">
                                {/* simple hamburger icon */}
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12h18M3 6h18M3 18h18"/>
                                </svg>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right"
                                      className="bg-popover text-popover-foreground max-w-md w-full sm:w-[400px] shadow-lg box-content"
                                      customClose={true}>
                            <SheetHeader
                                className="relative flex items-center justify-between px-4 py-3 border-b bg-background/60">
                                <div className="flex items-center gap-3">
                                    <img src="/vite.svg" alt="logo" className="h-7 w-7"/>
                                    <SheetTitle className="text-base">Menu</SheetTitle>
                                </div>

                                {/* small close button to the right of header for quick dismiss */}
                                <SheetPrimitive.Close className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xs hover:opacity-100 disabled:pointer-events-none">
                                    <Button variant={"ghost"} aria-label="Close menu">
                                        <XIcon className="size-4" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </SheetPrimitive.Close>
                            </SheetHeader>

                            <div className="px-4 py-3 flex flex-col justify-between gap-4 h-full overflow-y-auto">
                                <div>
                                    {/* Enhanced search bar: larger touch target, subtle bg, clear button */}
                                    <div className="relative mb-3">
                                        <SearchIcon className="absolute left-3 top-3 text-muted-foreground size-4"/>
                                        <Input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search meals, tags, ingredients..."
                                            className="w-full pl-10 pr-10 h-10 rounded-lg bg-background/60"
                                            autoFocus={false}
                                            aria-label="Search meals"
                                        />

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="absolute right-2 top-2.5 h-6"
                                            onClick={() => {
                                                // For now just navigate to search page with query param
                                                navigate(`/dashboard?q=${encodeURIComponent(query)}`);
                                                setOpen(false);
                                            }}
                                        >
                                            Go
                                        </Button>
                                    </div>

                                    {/* Suggestions to improve discoverability */}
                                    <div className="mb-3">
                                        <div className="text-xs text-muted-foreground px-1">Suggestions</div>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    className="w-full text-left px-3 py-2 rounded-md bg-transparent hover:bg-accent/5 transition text-sm"
                                                    onClick={() => {
                                                        setQuery(s);
                                                        navigate(`/dashboard?q=${encodeURIComponent(s)}`);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Navigation: larger tappable rows with icons and clear affordance */}
                                    <nav className="flex flex-col gap-2">
                                        <Button asChild variant="ghost" className="justify-start rounded-md px-0">
                                            <Link to="/" onClick={() => setOpen(false)}
                                                  className="w-full flex items-center gap-3 text-left px-3 py-3 text-sm text-foreground hover:bg-accent/5 transition rounded-md">
                                                <Home className="size-5 text-muted-foreground"/>
                                                <span className="flex-1">Home</span>
                                                <span className="text-xs text-muted-foreground">Overview</span>
                                            </Link>
                                        </Button>

                                        <Button asChild variant="ghost" className="justify-start rounded-md px-0">
                                            <Link to="/dashboard" onClick={() => setOpen(false)}
                                                  className="w-full flex items-center gap-3 text-left px-3 py-3 text-sm text-foreground hover:bg-accent/5 transition rounded-md">
                                                <Grid className="size-5 text-muted-foreground"/>
                                                <span className="flex-1">Dashboard</span>
                                                <span className="text-xs text-muted-foreground">Stats & overview</span>
                                            </Link>
                                        </Button>

                                        <Button asChild variant="ghost" className="justify-start rounded-md px-0">
                                            <Link to="/meal/6710be8fa96fc13495b30e0d" onClick={() => setOpen(false)}
                                                  className="w-full flex items-center gap-3 text-left px-3 py-3 text-sm text-foreground hover:bg-accent/5 transition rounded-md">
                                                <Grid className="size-5 text-muted-foreground"/>
                                                <span className="flex-1">Example Meal</span>
                                                <span className="text-xs text-muted-foreground">Open sample</span>
                                            </Link>
                                        </Button>
                                    </nav>

                                    <div className="pt-3 border-t mt-3">
                                        <div className="text-xs text-muted-foreground">Quick actions</div>
                                        <div className="mt-3 space-y-2">
                                            <Button
                                                onClick={() => {
                                                    navigate('/meal/new');
                                                    setOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <Plus className="size-4" />
                                                <span>New Meal</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    navigate('/settings');
                                                    setOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <Settings className="size-4" />
                                                <span>Settings</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Account row: prominent login/logout and user info */}

                            </div>

                            <SheetFooter className="border-t py-3 bg-background/50">
                                <div className="flex items-center gap-3 px-4">
                                    <div
                                        className="rounded-full bg-accent h-10 w-10 flex items-center justify-center text-sm text-accent-foreground">
                                        {initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{user?.name ?? "Guest"}</div>
                                        <div
                                            className="text-xs text-muted-foreground">{isAuthenticated ? "Signed in" : "Not signed in"}</div>
                                    </div>
                                    <div>
                                        {isAuthenticated ? (
                                            <Button variant="outline" size="sm" onClick={() => {
                                                logout();
                                                navigate('/login');
                                                setOpen(false);
                                            }}>
                                                Logout
                                            </Button>
                                        ) : (
                                            <Button variant="default" size="sm" onClick={() => {
                                                navigate('/login');
                                                setOpen(false);
                                            }}>
                                                Login
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div
                                    className="w-full text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Meal
                                    Planer
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <div
                                        className="rounded-full bg-accent h-8 w-8 flex items-center justify-center text-sm text-accent-foreground">
                                        {initials}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48">
                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-medium">{user?.name ?? "Guest"}</div>
                                    <div className="text-xs text-muted-foreground">{/* optional extra info */}</div>
                                    <div className="pt-2">
                                        {isAuthenticated ? (
                                            <Button variant="outline" onClick={() => {
                                                logout();
                                                navigate('/login');
                                            }}>
                                                Logout
                                            </Button>
                                        ) : (
                                            <Button variant="default" onClick={() => navigate('/login')}>
                                                Login
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
