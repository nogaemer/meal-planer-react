import {Outlet} from 'react-router-dom';
import Navbar from '@/components/Navbar.tsx';

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
                {/* Page Content (Outlet) */}
                    <Outlet/>

                {/* FOOTER: Pushed to bottom of scrollable area */}
                <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/5">
                    <div className="container">
                        &copy; {new Date().getFullYear()} My App. All rights reserved.
                    </div>
                </footer>
            </main>
        </div>
    );
}
