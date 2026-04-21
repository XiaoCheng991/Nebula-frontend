# External Integrations

**Analysis Date:** 2026-04-20

## APIs & External Services

### Supabase (Primary Backend)

**Purpose:** Authentication, database, storage, and real-time subscriptions
- **SDK:** `@supabase/supabase-js` 2.100.0, `@supabase/ssr` 0.10.0
- **Auth:** Email/password + GitHub OAuth (see below)
- **Database:** PostgreSQL via Supabase
- **Storage:** Supabase Storage for user avatars
- **Client Files:**
  - `src/lib/supabase/client.ts` - Browser client (createBrowserClient)
  - `src/lib/supabase/server.ts` - Server client (createServerClient)
  - `src/lib/supabase/types.ts` - Database type definitions
- **Modules:**
  - `src/lib/supabase/modules/blog.ts`
  - `src/lib/supabase/modules/memo.ts`
  - `src/lib/supabase/modules/website.ts`

### GitHub OAuth

**Purpose:** Social login via GitHub
- **Provider:** Supabase auth with GitHub provider
- **Configuration:** Via Supabase dashboard (environment variables)
- **Callback:** `src/app/auth/github/callback/page.tsx`
- **Scope:** `read:user user:email`
- **Implementation:** `src/lib/api/adapters/auth-adapter.ts` - `loginWithGithub()`

### MinIO Object Storage

**Purpose:** File storage for user uploads (separate from Supabase Storage)
- **SDK:** `minio` 8.0.6
- **Client File:** `src/lib/minio.ts`
- **Configuration:** Environment variables (MINIO_ENDPOINT, MINIO_PORT, etc.)
- **Features:**
  - Automatic bucket creation
  - Public access policy
  - File upload/delete operations

### AI Services

**OpenAI:**
- **SDK:** `@ai-sdk/openai` 0.0.66, `openai` 4.68.4
- **Usage:** AI chat functionality
- **Configuration:** Via environment variables

**Anthropic:**
- **SDK:** `@anthropic-ai/sdk` 0.39.0
- **Usage:** AI chat functionality
- **Configuration:** Via environment variables

**Vercel AI SDK:**
- **SDK:** `ai` 3.3.0
- **Purpose:** Unified streaming interface for AI providers

**MiniMax (Chinese AI):**
- **API:** Custom integration via `MINIMAX_API_KEY`, `MINIMAX_API_URL`
- **Model:** `MINIMAX_MODEL=abab6.5s-chat`
- **Purpose:** Additional AI chat capability

### Social Media Data (Agent Reach)

**Purpose:** Fetch social media profile statistics
- **Client File:** `src/lib/agent-reach.ts`
- **Platforms Supported:**
  - GitHub (real API)
  - Bilibili (JSONP API)
  - Xiaohongshu, Douyin, Weibo, YouTube, Twitter (mock data)
  - Juejin, CSDN (not supported)
- **Features:**
  - URL validation and normalization
  - Username extraction
  - Platform statistics (followers, posts, likes, views)

### Public APIs

**GitHub API:**
- Endpoint: `https://api.github.com/users/{username}`
- Auth: None (public)
- Purpose: Fetch GitHub profile stats

**Bilibili API:**
- Endpoints: `api.bilibili.com/x/relation/stat`, `api.bilibili.com/x/space/acc/info`
- Auth: None (public, JSONP)
- Purpose: Fetch Bilibili follower counts

## Data Storage

### Databases

**Supabase PostgreSQL:**
- Connection: Via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ORM: Direct Supabase client (no Prisma)
- Tables: `sys_users`, blogs, memos, etc.

**Local Storage (Browser):**
- User preferences (language, permissions)
- User info cache
- Session data

### File Storage

**Dual Storage Approach:**

1. **Supabase Storage:**
   - Bucket: `user-avatar` (profile pictures)
   - Access: Public read, authenticated write
   - Client: `src/lib/supabase/client.ts`

2. **MinIO (S3-compatible):**
   - Default bucket: `user-uploads`
   - Purpose: General file storage (drive feature)
   - Configuration: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, etc.

### Caching

**Client-side:**
- React Query (TanStack Query) - Server state caching
- Zustand - In-memory state with localStorage/persist

**No external cache service configured**

## Authentication & Identity

**Provider:** Supabase Auth
- **Methods:**
  - Email/Password registration and login
  - GitHub OAuth (social login)
- **Files:**
  - `src/lib/auth.ts` - Auth utilities entry point
  - `src/lib/api/adapters/auth-adapter.ts` - Supabase auth implementation
  - `src/lib/server-auth.ts` - Server-side auth helpers
  - `src/lib/auth/token-manager.ts` - Token management
  - `src/middleware.ts` - Route protection
- **Route Protection:** Middleware-based auth guards

## Monitoring & Observability

**Error Tracking:**
- None configured
- Console logging in development
- Console removal plugin in production (babel-plugin-transform-remove-console)

**Logs:**
- Custom logger: `src/lib/utils/logger.ts`
- Console.log statements throughout codebase

## CI/CD & Deployment

**Hosting:**
- Not specified (supports Next.js standard targets)
- Compatible with Vercel, Netlify, or self-hosted

**CI Pipeline:**
- None configured

## Environment Configuration

**Required environment variables:**

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub login |
| `MINIO_ENDPOINT` | MinIO server hostname | For file storage |
| `MINIO_PORT` | MinIO server port | For file storage |
| `MINIO_ACCESS_KEY` | MinIO access key | For file storage |
| `MINIO_SECRET_KEY` | MinIO secret key | For file storage |
| `MINIO_BUCKET` | MinIO bucket name | For file storage |
| `MINIO_PUBLIC_URL` | MinIO public URL | For file storage |
| `MINIMAX_API_KEY` | MiniMax API key | For AI features |
| `MINIMAX_API_URL` | MiniMax API endpoint | For AI features |
| `MINIMAX_MODEL` | MiniMax model name | For AI features |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | Yes |

**Configuration Mode:**
- `NEXT_PUBLIC_API_MODE=supabase` - API mode selector
- Supports `java-backend` or `supabase` modes

## Webhooks & Callbacks

**Incoming:**
- Supabase auth callbacks (`/auth/callback`, `/auth/github/callback`)
- OAuth redirect handling

**Outgoing:**
- None configured

---

*Integration audit: 2026-04-20*