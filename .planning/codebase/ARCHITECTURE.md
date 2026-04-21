# Architecture

**Analysis Date:** 2026/04/20

## Pattern Overview

**Overall:** Next.js 14 App Router with Supabase Backend-as-a-Service

**Key Characteristics:**
- Next.js 14 App Router for routing and SSR/SSG
- Route Groups using `(auth)` and `(tools)` parentheses notation
- Supabase for authentication, database, and storage
- Server-side middleware for route protection
- Client-side AuthGuard components for route-level access control
- React Query (TanStack Query) for data fetching and caching
- Zustand for client state management

## Layers

**Presentation Layer (Client Components):**
- Purpose: UI rendering and user interaction
- Location: `src/app/` and `src/components/`
- Contains: Pages, UI components, layouts
- Depends on: `src/hooks/`, `src/lib/`
- Used by: Browser

**Business Logic Layer (Hooks):**
- Purpose: Reusable stateful logic and data fetching
- Location: `src/hooks/`
- Contains: useTheme, useUser, usePermission, useAdminStore, useAppStore, etc.
- Depends on: `src/lib/supabase/`, `src/lib/api/`
- Used by: `src/components/`, `src/app/`

**Data Access Layer (API Modules):**
- Purpose: API communication and data operations
- Location: `src/lib/api/modules/`, `src/lib/supabase/`
- Contains: API adapters, Supabase modules (auth, user, file, drive, admin, blog, memo)
- Depends on: Supabase SDK
- Used by: `src/hooks/`, `src/components/`

**Infrastructure Layer:**
- Purpose: Core utilities and configurations
- Location: `src/lib/`
- Contains: Supabase client/server setup, auth utilities, utils, types
- Depends on: External services (Supabase)
- Used by: All layers

## Data Flow

**Authentication Flow:**
1. User visits protected route (e.g., `/dashboard`)
2. `src/middleware.ts` intercepts request
3. Middleware creates Supabase server client, reads session cookies
4. If no session, redirects to `/login?redirect=/dashboard`
5. On login, `src/lib/api/adapters/auth-adapter.ts` calls Supabase
6. Session stored in cookies via Supabase SSR
7. `src/components/auth/AuthGuard.tsx` confirms auth on client
8. `src/components/ClientLayout.tsx` wraps app with UserProvider

**Page Rendering Flow:**
1. `src/app/layout.tsx` defines root HTML with ClientLayout wrapper
2. ClientLayout provides: ThemeProvider, QueryProvider, UserProvider
3. Route-specific layouts wrap pages (e.g., admin layout)
4. Pages use ProtectedRoute/PublicRoute guards
5. Data fetching via API modules or direct Supabase queries

**Route Groups:**
- `(auth)` - Login, register, forgot-password pages (public routes)
- `(tools)` - Tools pages (public, with GlobalHeader)
- Root-level routes - Dashboard, chat, drive, settings, admin (protected)

## Key Abstractions

**AuthGuard Component:**
- Purpose: Route-level authentication wrapper
- Examples: `src/components/auth/AuthGuard.tsx`
- Pattern: HOC with `ProtectedRoute` and `PublicRoute` variants
- Checks: Sync token check + async Supabase session validation

**UserContext:**
- Purpose: Global user state management
- Examples: `src/lib/user-context.tsx`
- Pattern: React Context + useEffect for initialization
- Features: localStorage caching, Supabase auth listener, timeout protection

**API Adapters:**
- Purpose: Unified API interface
- Examples: `src/lib/api/adapters/auth-adapter.ts`
- Pattern: Re-exports from individual adapters
- Migration: Was REST API, now Supabase-based

**Supabase Modules:**
- Purpose: Database table operations
- Examples: `src/lib/supabase/modules/blog.ts`, `src/lib/supabase/modules/memo.ts`
- Pattern: Direct Supabase client queries per table

**API Modules:**
- Purpose: Business logic operations
- Examples: `src/lib/api/modules/social-media.ts`, `src/lib/api/modules/drive.ts`
- Pattern: Complex operations combining multiple data sources

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: HTML structure, theme script (prevents flash), ClientLayout wrapper

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every server-side request
- Responsibilities: Session validation, route protection, redirect logic

**ClientLayout:**
- Location: `src/components/ClientLayout.tsx`
- Triggers: After hydration
- Responsibilities: Providers setup, admin/auth page detection, GlobalHeader rendering

**AdminLayout:**
- Location: `src/components/admin/layout/AdminLayout.tsx`
- Triggers: Any `/admin/*` route
- Responsibilities: Sidebar, header, permission checking, admin data loading

## Error Handling

**Strategy:** Multi-layer error handling

**Patterns:**
- Server errors: `src/lib/utils/error-handler.ts` centralized error handling
- API errors: Try-catch with toast notifications
- Auth errors: Redirect to login or show AuthRequiredToast
- Component errors: Error boundaries via `src/app/error.tsx`, `src/app/global-error.tsx`
- Logging: `src/lib/utils/logger.ts` for structured logging

## Cross-Cutting Concerns

**Logging:**
- Approach: `src/lib/utils/logger.ts` - structured logging utility
- Console logging for development
- Context-aware logging with timestamps

**Validation:**
- Approach: Client-side validation before API calls
- Toast notifications for error feedback
- Password strength validation (register page)

**Authentication:**
- Approach: Supabase Auth with SSR cookie handling
- Middleware: Server-side route protection
- AuthGuard: Client-side component protection
- UserContext: Session state synchronization

**Theming:**
- Approach: Zustand store + CSS class toggle
- Files: `src/components/ThemeProvider.tsx`, `src/hooks/useTheme.ts`
- Features: Light/dark/system modes, flash prevention script
- Storage: localStorage with `theme` key

**Internationalization:**
- Approach: useLanguage hook
- Files: `src/hooks/useLanguage.ts`, `src/lib/i18n/locales/`
- Pattern: Function-based translations (not Next.js i18n)

---

*Architecture analysis: 2026/04/20*