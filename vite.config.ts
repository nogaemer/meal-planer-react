import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        {
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
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    radix: [
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
                    ui: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', 'cmdk', 'embla-carousel-react', 'sonner', 'vaul'],
                    dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
                }
            }
        }
    },
})
