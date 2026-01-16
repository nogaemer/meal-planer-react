/**
 * Navbar.tsx - Application navigation bar with real-time search and authentication
 */

import React from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {Carrot, Grid, Home, Plus, Search as SearchIcon, Settings, Tag, Utensils, X as XIcon} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import {Separator} from "@/components/ui/separator.tsx";
import {Client} from "@stomp/stompjs";

/**
 * Structure for search suggestions received from WebSocket or generated locally
 */
interface SearchSuggestion {
    text: string;
    type: string;
    id?: string;
}

/**
 * Navbar component providing responsive navigation, real-time search, and user authentication UI
 * 
 * Features include:
 * - Real-time search with WebSocket-powered suggestions for meals, ingredients, and tags
 * - Responsive design with desktop search bar and mobile sheet menu
 * - Keyboard navigation support (Arrow keys, Enter, Escape) for search suggestions
 * - User authentication status display with login/logout functionality
 * - Navigation links to Dashboard, Settings, and quick actions
 * 
 * @returns {JSX.Element} A responsive navigation header with search and authentication
 * 
 * @example
 * <Navbar />
 */
const Navbar: React.FC = () => {
    const {user, logout, isAuthenticated} = useAuth();
    const navigate = useNavigate();

    // Extract user initials from name for avatar display (max 2 characters)
    const initials = (user?.name ?? "U").split(" ").map(s => s[0]).slice(0, 2).join("");

    // Controlled open state for mobile sheet menu
    const [open, setOpen] = React.useState(false);

    // Search state management
    const [searchParams] = useSearchParams();
    const [query, setQuery] = React.useState(searchParams.get("q") || "");
    const [isFocused, setIsFocused] = React.useState(false);
    const [stompClient, setStompClient] = React.useState<Client | null>(null);
    const [serverSuggestions, setServerSuggestions] = React.useState<SearchSuggestion[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(-1); // For keyboard navigation in suggestions

    /**
     * WebSocket connection setup for real-time search suggestions
     * Establishes STOMP client connection with authentication token
     * Subscribes to /topic/suggestions for receiving search results
     */
    React.useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const baseUrl = import.meta.env.VITE_SPRING_APP_API_URL || 'http://localhost:8080';
        // Construct the WebSocket URL with appropriate protocol (ws:// or wss://)
        const wsProtocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
        const cleanBaseUrl = baseUrl.replace(/^https?:\/\//, '');
        const backendUrl = `${wsProtocol}//${cleanBaseUrl}/ws-search`;

        // Include authentication token as query parameter
        const brokerURL = `${backendUrl}?token=${token}`;

        const client = new Client({
            brokerURL: brokerURL,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected via Native WebSocket!");
                setStompClient(client);

                // Subscribe to suggestion topic to receive real-time search results
                client.subscribe('/topic/suggestions', (message) => {
                    if (message.body) {
                        try {
                            const results = JSON.parse(message.body);
                            setServerSuggestions(results);
                        } catch (e) {
                            console.error("Failed to parse search results", e);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        // Cleanup: deactivate WebSocket connection on unmount
        return () => {
            client.deactivate();
        };
    }, [isAuthenticated]);

    /**
     * Debounced search query publisher
     * Sends search queries to the backend via WebSocket after a short delay
     * Clears server suggestions when query is empty
     */
    React.useEffect(() => {
        if (!query || !stompClient || !stompClient.connected) {
            if (!query) setServerSuggestions([]);
            return;
        }

        // Debounce search requests by 50ms to reduce server load
        const timeoutId = setTimeout(() => {
            stompClient.publish({
                destination: "/app/suggest",
                body: JSON.stringify({query: query})
            });
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [query, stompClient]);

    /**
     * Memoized search suggestions with fallback to default suggestions
     * Prioritizes server suggestions, then filters default suggestions by query
     */
    const suggestions = React.useMemo<SearchSuggestion[]>(() => {
        const defaultSuggestions: SearchSuggestion[] = [
            {text: "Pasta", type: "meal"},
            {text: "Couscous-Salat", type: "meal"},
            {text: "Chicken Curry", type: "meal"}
        ];

        if (!query) return defaultSuggestions;
        if (serverSuggestions.length > 0) return serverSuggestions;

        const q = query.toLowerCase();
        return defaultSuggestions.filter(s => s.text.toLowerCase().includes(q));
    }, [query, serverSuggestions]);

    // Reset selected index when suggestions change
    React.useEffect(() => {
        setSelectedIndex(-1);
    }, [suggestions]);

    /**
     * Returns appropriate icon component based on suggestion type
     * @param {string} type - The type of search result (meal, ingredient, tag)
     * @returns {JSX.Element} Icon component for the given type
     */
    const getIconForType = (type: string) => {
        switch (type) {
            case 'meal':
                return <Utensils className="h-4 w-4 text-muted-foreground"/>;
            case 'ingredient':
                return <Carrot className="h-4 w-4 text-muted-foreground"/>;
            case 'tag':
                return <Tag className="h-4 w-4 text-muted-foreground"/>;
            default:
                return <SearchIcon className="h-4 w-4 text-muted-foreground"/>;
        }
    };

    return (
        <header className="w-full border-b bg-background/80 backdrop-blur-lg dark:bg-background/80 z-40">
            <div className="mx-auto lg:px-12 px-4 py-3 flex items-center md:gap-8 gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/vite.svg" alt="logo" className="h-8 w-8"/>
                        <span className="font-medium text-lg sm:block hidden">Meal Planer</span>
                    </Link>
                </div>

                {/* Desktop search bar with real-time suggestions and keyboard navigation */}
                <div className="flex flex-1 items-center max-w-2xl relative">
                    <div className="relative w-full mr-3">
                        <Input
                            placeholder="Search meals, tags, ingredients..."
                            className="h-9 w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click events
                            onKeyDown={(e) => {
                                // Keyboard navigation: Arrow Down - move to next suggestion
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => (prev + 1) % suggestions.length);
                                // Keyboard navigation: Arrow Up - move to previous suggestion
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                                // Execute search on Enter key
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Navigate to selected suggestion or raw query
                                    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                                        const s = suggestions[selectedIndex];
                                        setQuery(s.text);
                                        navigate(`/dashboard?q=${encodeURIComponent(s.text)}`);
                                        setIsFocused(false);
                                    } else {
                                        navigate(`/dashboard?q=${encodeURIComponent(query)}`);
                                        setIsFocused(false);
                                    }
                                // Close suggestions dropdown on Escape
                                } else if (e.key === 'Escape') {
                                    setIsFocused(false);
                                }
                            }}
                        />
                        {/* Dropdown suggestions panel with clickable and keyboard-navigable items */}
                        {isFocused && suggestions.length > 0 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground shadow-md rounded-md border z-50 max-h-[300px] overflow-y-auto">
                                <div className="p-1">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-sm ${i === selectedIndex ? "bg-accent text-accent-foreground" : ""}`}
                                            onClick={() => {
                                                setQuery(s.text);
                                                navigate(`/dashboard?q=${encodeURIComponent(s.text)}`);
                                                setIsFocused(false);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                        >
                                            {getIconForType(s.type)}
                                            <span className="flex-1">{s.text}</span>
                                            <span
                                                className="text-xs text-muted-foreground opacity-50 capitalize">{s.type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/*<Button variant="outline" className="sm:hidden block"*/}
                    {/*        onClick={() => navigate(`/dashboard?q=${encodeURIComponent(query)}`)}>*/}
                    {/*    <Search/>*/}
                    {/*</Button>*/}
                </div>

                <div className="flex items-center gap-3">
                    {/* Mobile navigation: Sheet drawer with menu, search, and user info */}
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
                                <SheetPrimitive.Close
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xs hover:opacity-100 disabled:pointer-events-none">
                                    <Button variant={"ghost"} aria-label="Close menu">
                                        <XIcon className="size-4"/>
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </SheetPrimitive.Close>
                            </SheetHeader>

                            <div className="px-4 py-3 flex flex-col justify-between gap-4 h-full overflow-y-auto">
                                <div>
                                    {/* Mobile search bar with icon and action button */}
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
                                                // Navigate to dashboard with search query parameter
                                                navigate(`/dashboard?q=${encodeURIComponent(query)}`);
                                                setOpen(false);
                                            }}
                                        >
                                            Go
                                        </Button>
                                    </div>

                                    {/* Search suggestions list for mobile with type icons */}
                                    <div className="mb-3">
                                        <div className="text-xs text-muted-foreground px-1">Suggestions</div>
                                        <div className="mt-2 flex flex-col gap-1">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    className="w-full text-left px-3 py-2 rounded-md bg-transparent hover:bg-accent/5 transition text-sm flex items-center gap-2"
                                                    onClick={() => {
                                                        setQuery(s.text);
                                                        navigate(`/dashboard?q=${encodeURIComponent(s.text)}`);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {getIconForType(s.type)}
                                                    <div className="flex flex-col items-start leading-none gap-0.5">
                                                        <span>{s.text}</span>
                                                        <span
                                                            className="text-[10px] text-muted-foreground capitalize">{s.type}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile navigation links with icons and descriptions */}
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

                                    {/* Quick action buttons for common tasks */}
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
                                                <Plus className="size-4"/>
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
                                                <Settings className="size-4"/>
                                                <span>Settings</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile sheet footer with user profile, auth status, and login/logout */}
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
                                <Separator/>
                                <div
                                    className="w-full text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Meal
                                    Planer
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop navigation: Dashboard link and user profile popover */}
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
