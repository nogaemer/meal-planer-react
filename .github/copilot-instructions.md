# GitHub Copilot Instructions for meal-planer-react

This document provides guidance for GitHub Copilot when working with this repository.

## Project Overview

A meal planning React application built with TypeScript, Vite, and Tailwind CSS. The application features authentication, meal management, and a modern UI using Radix UI components.

## Technology Stack

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.11
- **Styling**: Tailwind CSS 4.1.13 with custom components
- **UI Components**: Radix UI primitives
- **Routing**: React Router DOM 7.9.1
- **State Management**: React Context API
- **HTTP Client**: Custom httpClient service
- **Drag & Drop**: @dnd-kit
- **Theme**: next-themes for dark/light mode

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # Reusable UI components (shadcn/ui style)
│   ├── meal/         # Meal-specific components
│   ├── MainLayout.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── contexts/         # React Context providers
│   ├── auth-context.tsx
│   └── theme-provider.tsx
├── hooks/           # Custom React hooks
│   ├── useAuth.ts
│   └── useTheme.ts
├── pages/           # Page components
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── MealPage.tsx
│   ├── MealEditPage.tsx
│   ├── MealCreatePage.tsx
│   └── AuthCallbackPage.tsx
├── services/        # API services
│   ├── httpClient.ts
│   └── authService.ts
├── types/          # TypeScript type definitions
│   ├── auth.ts
│   ├── meal.ts
│   └── ratings.ts
├── utils/          # Utility functions
├── lib/            # Library configurations
├── assets/         # Static assets
├── App.tsx         # Main app component
└── main.tsx        # Application entry point
```

## Coding Conventions

### General

- Use TypeScript for all new files
- Follow ESLint rules defined in `eslint.config.js`
- `@typescript-eslint/no-explicit-any` is disabled, but prefer proper typing when possible
- Use functional components with hooks
- Prefer named exports for services and utilities, default exports for pages and main components

### Import Aliases

- Use `@/` alias for imports from `src/` directory (configured in `tsconfig.json` and `vite.config.ts`)
- Example: `import { Button } from '@/components/ui/button'`

### Component Structure

- **UI Components**: Located in `src/components/ui/`, follow shadcn/ui patterns
  - Use class-variance-authority (cva) for component variants
  - Use `cn()` utility from `@/lib/utils` for conditional classes
  - Combine Tailwind classes with `tailwind-merge`
- **Page Components**: Located in `src/pages/`, use lazy loading with React.lazy()
- **Layout Components**: Located in `src/components/`, include MainLayout and Navbar
- Use PascalCase for component files (e.g., `MealPage.tsx`, `Button.tsx`)
- Use kebab-case for utility/service files (e.g., `auth-context.tsx`, `useAuth.ts`)

### Styling

- Use Tailwind CSS utility classes
- Dark mode support through next-themes
- Follow the existing theme configuration
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`)
- Responsive design with Tailwind breakpoints

### State Management

- Use React Context API for global state (auth, theme)
- Create custom hooks to consume contexts (e.g., `useAuth`, `useTheme`)
- Keep component-level state local when possible
- Context providers are defined in `src/contexts/`

### API Services

- All API calls go through the `httpClient` in `src/services/httpClient.ts`
- Service classes in `src/services/` handle domain-specific API logic
- Use TypeScript types from `src/types/` for request/response data
- Environment variables are accessed via `import.meta.env` (Vite convention)
- API base URL is configured through `VITE_SPRING_APP_API_URL`

### Routing

- Use React Router DOM v7 for routing
- Protected routes wrapped with `ProtectedRoute` component
- Lazy load page components for better performance
- Use Suspense with a loading spinner fallback

### Forms and Validation

- Use Radix UI primitives for form elements
- Follow existing patterns in `login-form.tsx` for form handling

### Error Handling

- Display errors using Sonner toast notifications
- Handle authentication errors in httpClient interceptors

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server (with network access)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Code Quality

- Run `npm run lint` before committing
- TypeScript strict mode is not enabled, but prefer type safety
- ESLint configuration includes React Hooks rules and React Refresh plugin
- Fix any linting errors before submitting PRs

## Authentication

- OAuth authentication flow supported
- JWT token-based authentication
- Tokens managed through httpClient
- Auth state managed through AuthContext
- Protected routes require authentication

## Best Practices

1. **Component Design**:
   - Keep components small and focused
   - Extract reusable logic into custom hooks
   - Use composition over inheritance

2. **Performance**:
   - Lazy load routes
   - Code splitting configured in Vite (vendor, radix, ui, dnd chunks)
   - Optimize re-renders with proper React patterns

3. **Accessibility**:
   - Use Radix UI primitives (accessible by default)
   - Ensure keyboard navigation works
   - Provide proper ARIA labels

4. **Type Safety**:
   - Define types in `src/types/`
   - Use interfaces for object shapes
   - Prefer type inference where clear

5. **Testing**:
   - No test infrastructure currently exists
   - Manual testing recommended after changes

## Common Patterns

### Creating a new page:
1. Create component in `src/pages/`
2. Add lazy import in `App.tsx`
3. Add route to React Router configuration
4. Wrap in ProtectedRoute if authentication required

### Creating a new UI component:
1. Create in `src/components/ui/`
2. Follow shadcn/ui patterns
3. Use cva for variants
4. Export with proper TypeScript types

### Adding a new API endpoint:
1. Define types in `src/types/`
2. Add method to appropriate service in `src/services/`
3. Use httpClient for requests

## Notes

- Project uses pnpm in production but npm is also supported
- Vite configuration includes custom CSS inlining plugin for builds
- Theme is persisted in localStorage with key `vite-ui-theme`
- Default theme is dark mode
