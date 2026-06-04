# Codebase Structure

**Analysis Date:** 2026-06-03

## Directory Layout

```
Nebula-frontend/
├── .planning/codebase/       # GSD analysis documents (this directory)
├── branding/                  # Brand assets (SVGs, logos)
│   ├── nebulahub/             # NebulaHub brand assets
│   └── source/                # Logo source files (SVG, PNG)
├── public/                    # Static assets
│   ├── avatars/               # User avatar images
│   ├── exampleDesign/         # Example design files
│   ├── models/                # ML models (ONNX runtime WASM)
│   ├── music/                 # Music files
│   └── *.svg, *.jpg           # Logos, backgrounds, PDF.js workers
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (HTML shell, theme script)
│   │   ├── page.tsx           # Root page (redirects to /home)
│   │   ├── globals.css        # Global styles + CSS variables
│   │   ├── error.tsx          # Client error boundary
│   │   ├── global-error.tsx   # Root error page
│   │   ├── not-found.tsx      # 404 page
│   │   ├── about/
│   │   │   └── page.tsx       # Personal resume/portfolio page
│   │   └── blog/
│   │       ├── page.tsx       # Blog homepage (884 lines, monolithic)
│   │       └── [slug]/
│   │           └── page.tsx   # Individual blog article view
│   ├── components/
│   │   ├── LogoHeader.tsx     # Fixed top-left logo component
│   │   └── ui/                # shadcn/ui components (33 files)
│   │       ├── button.tsx, card.tsx, dialog.tsx, ...
│   │       └── use-toast.ts   # Toast hook
│   ├── hooks/                 # Custom hooks (EMPTY — 0 files)
│   └── lib/
│       ├── utils.ts           # General utilities (cn, formatDate, debounce, etc.)
│       ├── utils/
│       │   ├── logger.ts      # Dev-only structured logger
│       │   └── error-handler.ts # Auth/API error utilities
│       └── i18n/
│           └── locales/
│               ├── zh.json    # Chinese translations (auth pages)
│               └── en.json    # English translations (auth pages)
├── middleware.ts              # Next.js middleware (server-side auth guards)
├── next.config.ts             # Next.js config (image optimization, compression)
├── components.json            # shadcn/ui configuration
├── eslint.config.mjs          # ESLint config (core-web-vitals + TypeScript)
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript config (path aliases: @/ -> src/)
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router — all page components and layouts
- Contains: page.tsx, layout.tsx, error boundaries, route segments
- Key files: `layout.tsx` (root shell), `blog/page.tsx` (main homepage), `about/page.tsx` (resume)

**src/components/ui/:**
- Purpose: Reusable shadcn/radix UI primitives
- Contains: 31 .tsx components + 1 .ts hook (use-toast)
- Key files: `button.tsx`, `dialog.tsx`, `card.tsx`, `dropdown-menu.tsx`, `avatar-crop-dialog.tsx`, `user-avatar.tsx`

**src/lib/:**
- Purpose: Shared utilities, API clients, i18n
- Contains: `utils.ts`, `logger.ts`, `error-handler.ts`, i18n locale JSON
- Key files: `utils.ts` (cn, formatDate, debounce, throttle, etc.)

**src/hooks/:**
- Purpose: Custom React hooks (currently empty)
- Contains: nothing

**branding/:**
- Purpose: Brand identity assets
- Contains: SVG logos, PNG exports
- Key files: `source/logo_icon.svg`, `source/Nebula_Logo横排.svg`

**public/:**
- Purpose: Static files served at root URL
- Contains: avatars, backgrounds, music, ML models (ONNX), PDF.js workers
- Key files: `logo_icon.svg`, `login-bg.jpg`, `landing-bg.jpg`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` — Root HTML layout (all pages)
- `src/app/page.tsx` — Root URL handler (redirects to `/home`)
- `src/middleware.ts` — Server-side middleware (all non-static requests)

**Configuration:**
- `next.config.ts` — Next.js build/runtime config
- `components.json` — shadcn/ui config (style, aliases, CSS variables)
- `eslint.config.mjs` — ESLint rules
- `tsconfig.json` — TypeScript + path aliases (`@/` -> `src/`)

**Core Logic:**
- `src/app/blog/page.tsx` — Main homepage (data fetch, render, interactions)
- `src/app/about/page.tsx` — Resume/portfolio page
- `src/lib/utils.ts` — Shared utility functions

**Testing:**
- No test files exist. No test framework configured.

## Naming Conventions

**Files:**
- Components: kebab-case `.tsx` (e.g., `avatar-crop-dialog.tsx`, `user-avatar.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Utilities: camelCase `.ts` (e.g., `utils.ts`, `error-handler.ts`)
- Hooks: `use-` prefix (e.g., `use-toast.ts` — only existing example)

**Directories:**
- Route groups: parentheses `(auth)`, `(tools)` (deleted but pattern established)
- Dynamic routes: brackets `[slug]` (e.g., `blog/[slug]/`)
- UI components: `src/components/ui/` (flat, no nesting)
- Feature components: co-located `_components/` subdirectories (pattern from deleted code)

## Where to Add New Code

**New Page/Route:**
- Create `src/app/<route>/page.tsx` with `"use client"` directive if interactive
- Use existing UI components from `src/components/ui/`
- Add error boundary at `src/app/<route>/error.tsx` if needed

**New UI Component:**
- Add to `src/components/ui/<component-name>.tsx`
- Follow shadcn pattern: Radix primitive + `class-variance-authority` variants + `cn()` utility
- Export from component file directly (no barrel file)

**New Utility:**
- Add to `src/lib/utils.ts` if general-purpose
- Create `src/lib/<module>.ts` for domain-specific modules

**New Hook:**
- Add to `src/hooks/use-<name>.ts`
- Follow React hooks conventions (use prefix, return tuple/object)

**New API/Service Module:**
- Create `src/lib/<service>/` directory
- Pattern from deleted code: `src/lib/supabase/modules/blog.ts`, `src/lib/api/modules/file.ts`

## Special Directories

**src/app/(auth)/:**
- Previously existed (login, register, forgot-password pages) — now deleted from disk
- Route group pattern: parentheses don't affect URL

**src/app/(tools)/:**
- Previously existed (json-formatter tool page) — now deleted from disk

**src/app/admin/:**
- Previously existed (admin dashboard with users, roles, permissions, blog management) — now deleted from disk

**branding/:**
- Purpose: Brand identity source assets
- Generated: No (designer-created)
- Committed: Yes

**public/:**
- Purpose: Static assets served directly
- Generated: Some (ML models, PDF.js workers)
- Committed: Yes

---

*Structure analysis: 2026-06-03*
