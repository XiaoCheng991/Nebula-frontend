# Codebase Concerns

**Analysis Date:** 2026-04-20
**Last Updated:** 2026-04-20 (Initial fixes applied)

## Security Considerations

### ✅ FIXED: Exposed Credentials in .env.example

**Status:** Fixed on 2026-04-20

All real production credentials have been replaced with placeholder values:
- `MINIO_SECRET_KEY=<YOUR_MINIO_SECRET_KEY>`
- `MINIMAX_API_KEY=<YOUR_MINIMAX_API_KEY>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>`

### ✅ FIXED: MinIO Public Bucket Access

**Status:** Fixed on 2026-04-20

The MinIO bucket policy has been removed. The bucket now operates with:
- Private access (no public read policy)
- Server-side authentication required for uploads
- Note: For production, consider implementing signed URLs for file access

## Tech Debt - Fixed

### ✅ FIXED: Deprecated Empty Auth Module

**Status:** Fixed on 2026-04-20

Removed `src/lib/auth.ts` - all functionality migrated to Supabase SDK.

### ✅ FIXED: Deprecated API Client Module

**Status:** Fixed on 2026-04-20

Removed `src/lib/api/client.ts` - no longer needed with Supabase mode.

### ✅ FIXED: @ts-ignore Directives

**Status:** Fixed on 2026-04-20

Removed 3 `@ts-ignore` directives:
- `src/lib/agent-reach.ts` - Added proper type definitions for JSONP callbacks
- `src/components/ui/sonner.tsx` - Added type declaration for Sonner Toaster

### ✅ FIXED: Console Logging Throughout Codebase

**Status:** Fixed on 2026-04-20

Replaced `console.log/error/warn` with `apiLogger` utility across:
- 92+ console statements removed from 30+ files
- Now uses structured logging via `src/lib/utils/logger.ts`
- Logs only output in development mode (`NODE_ENV === 'development'`)

## Remaining Technical Debt

### ⚠️ INCOMPLETE: Social Media Data Fetching

**Status:** Not changed - requires backend integration

Only GitHub and Bilibili platforms use real APIs. Other platforms fall back to mock data.

### ⚠️ INCOMPLETE: YouTube Data API Not Implemented

**Status:** Not changed - requires API key

YouTube stats always show as 0 or mock data. Requires YouTube Data API v3 key.

### ⚠️ Missing Test Coverage

**Status:** Not changed - user requested no tests

Critical flows without tests:
- Authentication flow (login, logout, token refresh)
- File upload/download operations
- Admin role/permission system

## Performance Notes

### Large Files Requiring Code Splitting

**Files:**
- `src/lib/supabase/types.ts` - 1291 lines (consider splitting by table groups)
- `src/lib/api/modules/admin.ts` - 939 lines (consider splitting by feature)
- Various admin pages - 800+ lines each

### GitHub API Rate Limit Risk

The blog page fetches all repos (up to 100) per page load, risking rate limit.

## Dependencies Notes

### Multiple AI SDK Versions

The project uses multiple AI SDK families:
- `@anthropic-ai/sdk` - Anthropic API
- `@ai-sdk/openai` + `openai` - OpenAI API
- `ai` - Vercel AI SDK

Consider standardizing on one AI SDK family for consistency.

---

*Concerns audit: 2026-04-20*
*Status: Major security and tech debt issues resolved*