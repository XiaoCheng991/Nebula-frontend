# Technology Stack

**Analysis Date:** 2026-04-20

## Languages

**Primary:**
- TypeScript 5.6.3 - Main language for all source code
- TSX/JSX - For React components

**Secondary:**
- CSS (via Tailwind) - Styling
- HTML - Template structure

## Runtime

**Environment:**
- Node.js - Server runtime
- Next.js 14.2.35 - React framework with App Router

**Package Manager:**
- npm - Package manager (standard)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.35 - Full-stack React framework with App Router
- React 18.3.1 - UI library

**Styling & UI:**
- Tailwind CSS 3.4.13 - Utility-first CSS framework
- shadcn/ui components - Radix UI based components (custom implementation)
- Radix UI - Unstyled, accessible component primitives
- Tailwind CSS Animate - Animation utilities
- Tailwind Typography - Prose styling
- Framer Motion 12.38.0 - Animation library

**State Management:**
- Zustand 5.0.0 - Lightweight state management
- React Context - Theme/language context
- React Query (TanStack Query) 5.96.2 - Server state and caching

**Forms & Validation:**
- Zod 3.23.8 - Schema validation

**Rich Text Editing:**
- Tiptap 3.22.1 - Rich text editor framework
  - Extensions: code-block-lowlight, image, link, placeholder, table

**Icons & Media:**
- lucide-react 0.447.0 - Icon library
- react-icons 5.6.0 - Additional icon sets

**Data Visualization:**
- Recharts 2.12.7 - Chart library

**Drag and Drop:**
- @dnd-kit/core 6.3.1 - Drag and drop primitives
- @dnd-kit/sortable 10.0.0 - Sortable list primitives

**PDF Processing:**
- pdf-lib 1.17.1 - PDF manipulation
- pdfjs-dist 3.4.120 - PDF rendering

**OCR:**
- tesseract.js 7.0.0 - OCR engine

**Code Editors:**
- Monaco Editor 0.52.0 - VS Code editor component

**AI Integration:**
- AI SDK (Vercel) 3.3.0 - AI streaming
- @ai-sdk/openai 0.0.66 - OpenAI provider
- @anthropic-ai/sdk 0.39.0 - Anthropic provider
- openai 4.68.4 - OpenAI API client
- onnxruntime-web 1.24.3 - WebAssembly ML runtime

**Image Processing:**
- Sharp 0.33.5 - Server-side image processing
- react-easy-crop 5.5.6 - Image cropping

**Markdown:**
- react-markdown 9.0.1 - Markdown rendering
- react-syntax-highlighter 15.5.0 - Syntax highlighting
- turndown 7.2.2 - HTML to Markdown conversion

**Utilities:**
- date-fns 4.1.0 - Date manipulation
- clsx 2.1.1 - Conditional class names
- tailwind-merge 2.6.0 - Tailwind class merging
- p-limit 5.0.0 - Promise concurrency limiting
- lowlight 3.3.0 - Syntax highlighting engine

**Database & Auth:**
- @supabase/supabase-js 2.100.0 - Supabase client
- @supabase/ssr 0.10.0 - SSR Supabase client

**Object Storage:**
- minio 8.0.6 - S3-compatible storage client

## Testing

**Test Runner:**
- Not configured - No test framework installed

**E2E Testing:**
- Not configured

## Build & Development

**Build Tool:**
- Next.js built-in webpack

**Linting:**
- ESLint 8.57.1 - Code linting
- eslint-config-next 14.2.14 - Next.js ESLint config

**Transpilation:**
- TypeScript compiler (tsc)
- Next.js Babel configuration

**Development:**
- next dev - Development server
- next build - Production build
- next lint - Linting command

**Post-processing:**
- PostCSS 8.4.47 - CSS processing
- Autoprefixer 10.4.20 - Vendor prefixing

## Configuration

**Environment:**
- `.env.example` - Template for environment variables
- `.env.local` - Local development variables (not committed)
- Path aliases: `@/*` maps to `./src/*`

**Build:**
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration

**Custom Next.js Config:**
- React Compiler enabled
- Babel plugin to remove console.log in production

## Internationalization

**Approach:** Custom lightweight solution (no i18n library)
- Zustand-based store for language state
- `src/hooks/useLanguage.ts` - Language hook with built-in zh/en translations
- Translations stored in-memory for login/register/common terms

## Platform Requirements

**Development:**
- Node.js 18+ recommended
- npm 6+ for package management

**Production:**
- Node.js server or serverless (Vercel/Netlify)
- Supabase backend
- MinIO compatible storage

---

*Stack analysis: 2026-04-20*