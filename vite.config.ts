/**
 * Vite configuration for the meal planner React application.
 * Configures React with SWC, Tailwind CSS, CSS inlining, path aliases, and code splitting.
 */
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(), // React plugin with SWC compiler for faster builds
        tailwindcss(), // Tailwind CSS integration
        {
            // Custom plugin to inline CSS into HTML during build for single-file distribution
            name: 'inline-css',
            apply: 'build',
            enforce: 'post',
            transformIndexHtml: {
                order: 'post',
                handler(html, ctx) {
                    if (!ctx.bundle) return html;
                    const cssFile = Object.values(ctx.bundle).find(
                        (chunk: any) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
                    ) as any;
                    if (!cssFile) return html;
                    const cssSource = cssFile.source;
                    const linkTagRegex = new RegExp(`<link[^>]*?href="[^"]*?${cssFile.fileName}"[^>]*?>`);
                    return html.replace(linkTagRegex, `<style>${cssSource}</style>`);
                }
            }
        }
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"), // Enables '@/' imports for src directory
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Split dependencies into separate chunks for better caching and load performance
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'], // Core React libraries
                    radix: [ // Radix UI component primitives
                        '@radix-ui/react-accordion',
                        '@radix-ui/react-aspect-ratio',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-label',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-scroll-area',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip'
                    ],
                    ui: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', 'cmdk', 'embla-carousel-react', 'sonner', 'vaul'], // UI utilities and component libraries
                    dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'] // Drag-and-drop functionality
                }
            }
        }
    },
})
