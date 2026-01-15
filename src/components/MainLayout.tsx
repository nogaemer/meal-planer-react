/**
 * MainLayout.tsx - Root layout wrapper with navigation and content outlet
 */

import {Outlet} from 'react-router-dom';
import Navbar from '@/components/Navbar.tsx';

/**
 * MainLayout component providing the root application layout structure
 * 
 * This component creates a full-viewport layout with a fixed navbar at the top
 * and a scrollable content area that contains the route-specific content and footer.
 * The layout prevents window-level scrolling and contains scroll within the main area.
 * 
 * @returns {JSX.Element} A flex-column layout with navbar, content outlet, and footer
 * 
 * @example
 * // Used in router configuration as the root layout:
 * <Route element={<MainLayout />}>
 *   <Route path="/" element={<Home />} />
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */
export default function MainLayout() {
    return (
        // ROOT: Full viewport height, no window scroll
        <div className="flex h-screen flex-col bg-background overflow-hidden">

            {/* NAVBAR: Fixed at the top */}
            {/* Ensure your Navbar component doesn't have 'fixed' class if it conflicts,
          but 'sticky top-0' inside this flex container works perfectly. */}
            <div className="z-50 border-b">
                <Navbar/>
            </div>


            {/* SCROLLABLE BODY: The only part that scrolls */}
            <main className="flex-1 overflow-hidden">
                {/* Page Content (Outlet): Renders child routes from React Router */}
                    <Outlet/>

                {/* FOOTER: Pushed to bottom of scrollable area with copyright info */}
                <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/5">
                    <div className="container">
                        &copy; {new Date().getFullYear()} My App. All rights reserved.
                    </div>
                </footer>
            </main>
        </div>
    );
}
