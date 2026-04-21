# Codebase Structure

**Analysis Date:** 2026/04/20

## Directory Layout

```
NebulaHub/Nebula-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and core logic
│   ├── providers/              # React context providers
│   └── middleware.ts           # Next.js middleware
├── public/                     # Static assets
├── db/                         # Database schema/migrations
├── branding/                   # Branding assets
├── supabase/                   # Supabase configuration
├── docs/                       # Documentation
├── .planning/                  # GSD planning documents
└── [config files]              # next.config.js, tailwind.config.ts, etc.
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js 14 App Router directory - all pages and routes
- Contains: Route groups, layouts, pages, API routes, error boundaries
- Key files:
  - `layout.tsx` - Root layout with ClientLayout wrapper
  - `page.tsx` - Root redirect to `/home`
  - `error.tsx` - Error boundary
  - `global-error.tsx` - Global error boundary
  - `not-found.tsx` - 404 page

**`src/components/`:**
- Purpose: Reusable React components
- Contains: UI primitives, feature components, layouts
- Subdirectories:
  - `ui/` - shadcn/ui components (button, dialog, input, etc.)
  - `auth/` - AuthGuard, AuthRequiredToast, LogoutButton, LanguageSwitcher
  - `admin/` - Admin layout (Sidebar, AdminHeader, AdminLayout), dialogs, DataTable
  - `branding/` - GlobalHeader, LogoHeader, social-icons
  - `chat/` - MessageInput, MessageItem, ChatLayout

**`src/hooks/`:**
- Purpose: Custom React hooks for stateful logic
- Contains: State management hooks, data fetching hooks
- Key files:
  - `useTheme.ts` - Theme state and effect (Zustand-based)
  - `useUser.ts` - User context access
  - `useLanguage.ts` - i18n hook
  - `useAdminStore.ts` - Admin data Zustand store
  - `useAppStore.ts` - App-wide state (permissions)
  - `usePermission.ts` - Permission checking
  - `useQueries.ts` - React Query setup
  - `useAuthPrompt.ts` - Auth prompt handling
  - `useAvatar.ts` - Avatar utilities
  - `useSystemConfig.ts` - System config
  - `useUsersCache.ts` - User caching

**`src/lib/`:**
- Purpose: Core utilities, API clients, types
- Subdirectories:
  - `api/` - API modules (modules/, adapters/)
  - `supabase/` - Supabase client/server setup (client.ts, server.ts, types.ts, modules/)
  - `utils/` - Utilities (utils.ts, error-handler.ts, logger.ts)
  - `admin/` - Admin types and mock data
  - `i18n/` - Internationalization (locales/)
  - `auth/` - Auth utilities (token-manager.ts)

**`src/providers/`:**
- Purpose: React context providers
- Key files:
  - `query-provider.tsx` - TanStack Query provider

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root HTML layout
- `src/middleware.ts` - Route protection middleware
- `src/app/page.tsx` - Root redirect to `/home`

**Configuration:**
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Register page
- `src/app/(auth)/forgot-password/page.tsx` - Password reset
- `src/app/dashboard/page.tsx` - Dashboard with social media stats
- `src/app/chat/page.tsx` - Chat page
- `src/app/drive/page.tsx` - Drive page
- `src/app/settings/page.tsx` - User settings
- `src/app/admin/page.tsx` - Admin index
- `src/app/admin/users/page.tsx` - User management
- `src/app/admin/permissions/page.tsx` - Permission management
- `src/app/admin/roles/page.tsx` - Role management
- `src/app/admin/menus/page.tsx` - Menu management
- `src/app/admin/blog/posts/page.tsx` - Blog posts management
- `src/app/admin/dictionaries/page.tsx` - Dictionary management
- `src/app/admin/im/*/page.tsx` - IM management (rooms, messages, bans, sensitive-words)
- `src/app/admin/logs/page.tsx` - Logs
- `src/app/admin/settings/page.tsx` - Admin settings
- `src/app/blog/page.tsx` - Blog listing
- `src/app/blog/[id]/page.tsx` - Blog post detail
- `src/app/blog/write/page.tsx` - Blog editor
- `src/app/memos/page.tsx` - Memos listing
- `src/app/memos/write/page.tsx` - Memo editor
- `src/app/memo/[id]/page.tsx` - Memo detail
- `src/app/home/page.tsx` - Home page
- `src/app/me/page.tsx` - User profile page

**Core Logic:**
- `src/components/ClientLayout.tsx` - Client-side layout wrapper with providers
- `src/components/ThemeProvider.tsx` - Theme provider
- `src/lib/user-context.tsx` - User context provider
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/api/adapters/auth-adapter.ts` - Auth API adapter
- `src/lib/api/modules/` - API modules per feature

**Testing:**
- Tests are co-located or in `__tests__` directories (not extensively used)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `AuthGuard.tsx`, `DataTable.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTheme.ts`, `usePermission.ts`)
- Utils: camelCase (e.g., `utils.ts`, `error-handler.ts`)
- Modules: camelCase or kebab-case (e.g., `social-media.ts`, `admin.ts`)
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- API Routes: `route.ts`
- Types: `types.ts` or co-located with interface definitions

**Directories:**
- Components: kebab-case or PascalCase groups (e.g., `admin/layout/`, `auth/`)
- Pages: Route path segments (e.g., `admin/blog/posts/`)
- Hooks: Flat in `hooks/` directory
- Lib: Flat with subdirectories for grouping

## Where to Add New Code

**New Feature Page:**
1. Primary code: `src/app/[feature]/page.tsx`
2. Layout (if needed): `src/app/[feature]/layout.tsx`
3. API routes: `src/app/api/[feature]/route.ts`
4. Data layer: `src/lib/api/modules/[feature].ts` or `src/lib/supabase/modules/[feature].ts`

**New Component:**
1. UI component: `src/components/ui/[ComponentName].tsx`
2. Feature component: `src/components/[feature]/[ComponentName].tsx`
3. Admin component: `src/components/admin/[feature]/[ComponentName].tsx`

**New Hook:**
1. Location: `src/hooks/use[Name].ts`
2. Follow existing pattern: Zustand store or useState/useEffect

**New API Module:**
1. Supabase operations: `src/lib/supabase/modules/[module].ts`
2. Complex business logic: `src/lib/api/modules/[module].ts`
3. Client utilities: `src/lib/api/adapters/[module].ts`

**Utilities:**
1. Shared helpers: `src/lib/utils/utils.ts`
2. Error handling: `src/lib/utils/error-handler.ts`
3. Logging: `src/lib/utils/logger.ts`

## Special Directories

**`src/app/admin/`:**
- Purpose: Admin dashboard pages
- Generated: No
- Committed: Yes
- Pattern: Has own layout (`AdminLayout`) with sidebar/header

**`src/components/ui/`:**
- Purpose: shadcn/ui component library
- Pattern: Based on Radix primitives with Tailwind styling
- Components: button, dialog, input, select, toast, card, etc.

**`src/lib/supabase/modules/`:**
- Purpose: Supabase database table operations
- Tables: blog, memo, website
- Pattern: Direct Supabase query functions

**`src/lib/api/modules/`:**
- Purpose: Complex API/business operations
- Modules: auth, user, file, drive, admin, social-media
- Pattern: Combines multiple data sources or complex logic

**`src/lib/i18n/locales/`:**
- Purpose: Internationalization translation files
- Pattern: JSON key-value translations per language

---

*Structure analysis: 2026/04/20*