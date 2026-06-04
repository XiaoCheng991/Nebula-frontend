<!-- refreshed: 2026-06-03 -->
# Architecture

**Analysis Date:** 2026-06-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js App Router                         │
│                    (Pages & Route Handlers)                      │
├────────────────┬──────────────────┬─────────────────────────────┤
│  /about page   │  /blog pages     │  Middleware (server)        │
│  page.tsx      │  page.tsx        │  src/middleware.ts           │
│  (477 lines)   │  (884 lines)    │  (route protection)         │
│                │  [slug]/page.tsx │                             │
└───────┬────────┴────────┬─────────┴──────────┬──────────────────┘
        │                 │                     │
        ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Components Layer                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │  UI Components (33)      │  │  Feature Components           │  │
│  │  src/components/ui/      │  │  LogoHeader.tsx               │  │
│  │  (shadcn/radix-based)    │  │  Social icons (DELETED)       │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Lib / Utility Layer                         │
│  ┌─────────────────┐ ┌──────────────┐ ┌───────────────────────┐ │
│  │  utils.ts        │ │  logger.ts   │ │  error-handler.ts     │ │
│  │  (general utils) │ │  (dev-only)  │ │  (auth+API errors)   │ │
│  └─────────────────┘ └──────────────┘ └───────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  DELETED modules (referenced in old blog/page.tsx):         ││
│  │  @/lib/supabase/client, @/lib/supabase/modules/blog         ││
│  │  @/lib/supabase/modules/memo, @/lib/api, @/lib/api/modules  ││
│  │  @/lib/user-context, @/lib/i18n                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  Supabase (auth + DB)  │  GitHub API (stars)  │  LocalStorage  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Page | Redirects to `/home` | `src/app/page.tsx` |
| Root Layout | HTML shell, Inter font, dark theme inline script | `src/app/layout.tsx` |
| Middleware | Server-side route protection for `/dashboard`, `/admin`, etc. | `src/middleware.ts` |
| Blog Page | Personal homepage: memo scroll, 3-col blog layout, avatar upload, bookmarks, GitHub projects | `src/app/blog/page.tsx` |
| Blog Detail | Single article view with HTML content rendering | `src/app/blog/[slug]/page.tsx` |
| About Page | Personal resume/portfolio page | `src/app/about/page.tsx` |
| Error Boundary | Client-side error display with retry | `src/app/error.tsx` |
| Global Error | Full HTML error page for root errors | `src/app/global-error.tsx` |
| Not Found | 404 page | `src/app/not-found.tsx` |
| UI Components | shadcn/radix primitives (31 .tsx + 1 .ts) | `src/components/ui/` |
| LogoHeader | Fixed top-left logo component | `src/components/LogoHeader.tsx` |

## Pattern Overview

**Overall:** Next.js App Router with Pages (no SPA state management library)

**Key Characteristics:**
- Next.js 14 App Router with `"use client"` Client Components for all interactive pages
- No dedicated state management (no Redux, Zustand, Jotai) — React useState + useContext patterns
- Supabase for backend (auth + PostgREST), though many lib modules are currently deleted from disk
- shadcn/ui component system (Radix primitives + Tailwind CSS)
- Dark mode via CSS variables + localStorage + inline `<script>` flash-prevention
- middleware.ts handles server-side auth guards

## Layers

**App Router Pages:**
- Purpose: Route-level page components, entry points for each URL
- Location: `src/app/`
- Contains: page.tsx, layout.tsx, error.tsx, not-found.tsx, global-error.tsx
- Depends on: components, lib utilities
- Used by: Next.js routing engine

**Middleware:**
- Purpose: Server-side route protection (auth checks before page render)
- Location: `src/middleware.ts`
- Contains: Supabase server client, path matching logic
- Depends on: `@supabase/ssr`
- Used by: Next.js request pipeline

**Components:**
- Purpose: Reusable UI building blocks
- Location: `src/components/ui/` (generic) + `src/components/` (feature)
- Contains: 33 shadcn-style Radix-based components + LogoHeader
- Depends on: `@radix-ui/*`, `class-variance-authority`, `tailwind-merge`, `lucide-react`
- Used by: Page components

**Lib/Utilities:**
- Purpose: Shared utility functions and API clients
- Location: `src/lib/`
- Contains: `utils.ts`, `logger.ts`, `error-handler.ts`, i18n locale JSON
- Depends on: (deleted modules depended on Supabase client)
- Used by: Pages and components (currently only error page and blog page import lib utils)

**Hooks:**
- Purpose: Custom React hooks (directory exists but is empty)
- Location: `src/hooks/`
- Contains: nothing currently; old code referenced `useAppStore`, `useThemeStore`, `useUser`
- Depends on: React
- Used by: (none currently)

## Data Flow

### Primary Request Path (Page Load)

1. Browser request hits Next.js server (`next dev` / `next start`)
2. `src/middleware.ts` runs: checks Supabase session cookie, may redirect unauthenticated users
3. Next.js matches URL to page component in `src/app/` route tree
4. `src/app/layout.tsx` renders HTML shell with inline theme script (prevents FOUC)
5. Page component renders (client component with `"use client"`)
6. Client-side `useEffect` fetches data from Supabase / GitHub API
7. React state updates trigger re-render with loaded data

### Blog Detail Page Load

1. URL `/blog/123` matched by `src/app/blog/[slug]/page.tsx`
2. Component extracts `params.id`, calls `getArticleById()` from `@/lib/supabase/modules/blog` (DELETED)
3. Loading skeleton shown while fetching; `notFound()` triggered on error

### Avatar Upload Flow

1. File input -> `handleAvatarUpload` validates type/size
2. Opens `AvatarCropDialog` for client-side crop
3. `handleCropComplete` uploads via `uploadAvatar()` to Supabase Storage
4. Updates `sys_users` table + Supabase auth metadata + localStorage
5. Dispatches `auth-change` event to refresh nav UI

## State Management

**No global state library.** State handled via:
- `useState` / `useEffect` within page components
- Supabase auth session (server-side cookie + client-side `onAuthStateChange`)
- localStorage for theme preference and cached user info
- Context providers existed previously (`useUser`, `useThemeStore`, `usePagePermission`) but are deleted from disk

## Key Abstractions

**shadcn/ui Component Pattern:**
- Purpose: Accessible, composable UI primitives
- Examples: `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/card.tsx`
- Pattern: Radix UI primitive + `class-variance-authority` variants + `cn()` utility

**Route Group Pattern:**
- Purpose: Organize routes without affecting URL path
- Examples: `(auth)` and `(tools)` route groups existed previously (now deleted)

**Client Component Pattern:**
- Purpose: All interactive pages marked with `"use client"` directive
- Examples: Every page component in `src/app/`
- Pattern: Top-level `"use client"`, useState for local state, useEffect for side effects

## Entry Points

**Browser Entry:**
- `src/app/layout.tsx` — Root layout wraps all pages
- `src/app/page.tsx` — Root URL, redirects to `/home`

**Route Entries:**
- `src/app/about/page.tsx` — `/about` — Personal resume page
- `src/app/blog/page.tsx` — `/blog` — Personal homepage with memos, articles, bookmarks
- `src/app/blog/[slug]/page.tsx` — `/blog/[slug]` — Individual article view

**Server Middleware:**
- `src/middleware.ts` — Runs on every non-static request, checks auth

## Architectural Constraints

- **Rendering:** All pages are Client Components (`"use client"`). No Server Components currently in use, despite Next.js 14 App Router supporting them.
- **Global state:** No Redux/Zustand. Only React built-in state + localStorage.
- **Component library:** Locked to shadcn/ui + Radix. Adding new UI primitives goes in `src/components/ui/`.
- **Path aliases:** `@/` maps to `src/` (configured in tsconfig + components.json)
- **Styling:** Tailwind CSS with CSS variables (HSL tokens in `globals.css`). No CSS modules, no styled-components.
- **Auth:** Supabase Auth with GitHub OAuth. Session cookies managed by `@supabase/ssr`.
- **Build:** Next.js webpack (not Turbopack by default). Console.log stripped in production via babel plugin.

## Anti-Patterns

### Monolithic Page Component

**What happens:** `src/app/blog/page.tsx` is 884 lines containing all homepage logic: data fetching, memo rendering, article layout, avatar upload, bookmark management, permission checks, GitHub star fetching.
**Why it's wrong:** Single component owns too many concerns. Hard to test, read, or modify without risk.
**Do this instead:** Extract logical sections into sub-components (e.g., `MemoScroll`, `BlogThreeColumn`, `AvatarUploadCard`, `BookmarkPanel`) under `src/app/blog/_components/`.

### Dead Import References

**What happens:** `src/app/blog/page.tsx` imports from `@/lib/supabase/client`, `@/lib/supabase/modules/blog`, `@/lib/supabase/modules/memo`, `@/lib/api`, `@/lib/api/modules/file`, `@/lib/user-context`, `@/hooks/useAppStore`, `@/components/branding/social-icons` — all deleted from disk.
**Why it's wrong:** Build failures. Page cannot compile. These were likely removed in a refactor.
**Do this instead:** Either restore the deleted lib modules from git history, or rewrite the page to use only available modules.

### Empty Hooks Directory

**What happens:** `src/hooks/` exists but contains zero files.
**Why it's wrong:** Confusing for developers. Unclear if hooks belong here or elsewhere.
**Do this instead:** Populate when custom hooks are created, or remove directory if unused.

### Root Redirect to Non-Existent Route

**What happens:** `src/app/page.tsx` redirects to `/home`, but no `/home` route exists.
**Why it's wrong:** Visiting `/` causes a 404 or redirect loop.
**Do this instead:** Redirect to `/blog` or render blog page directly at `/`.

## Error Handling

**Strategy:** Layered — middleware for auth errors, error boundaries for React errors, try/catch for API calls.

**Patterns:**
- `src/app/error.tsx`: Component-level error boundary with retry + home navigation
- `src/app/global-error.tsx`: Root-level error page (full HTML, no layout)
- `src/lib/utils/error-handler.ts`: Utility functions for auth expiry, network errors, API errors
- `src/lib/utils/logger.ts`: Dev-only structured logging (suppressed in production)
- Page-level `try/catch` with `toast()` notifications for user-facing errors

## Cross-Cutting Concerns

**Logging:** `src/lib/utils/logger.ts` — console output only in `development` mode; no external logging service.

**Validation:** Ad-hoc in page components (file type/size checks for avatar upload). Form validation uses Zod (dependency installed) but not currently used in existing pages.

**Authentication:** Supabase Auth via `@supabase/ssr` middleware (server) + client-side `supabase.auth` calls. GitHub OAuth supported in deleted auth pages.

**i18n:** Locale JSON files exist (`src/lib/i18n/locales/zh.json`, `en.json`) with auth page translations. Not wired into current pages.

**Theming:** CSS variables in `globals.css` (light/dark themes), `next-themes` installed. Theme switcher component at `src/components/ui/theme-switcher.tsx`.

---

*Architecture analysis: 2026-06-03*
