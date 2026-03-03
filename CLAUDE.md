# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NebulaHub 橙光 is a Next.js-based utility platform for friends, featuring real-time chat, file sharing, and AI integration. It uses a Spring Boot backend with PostgreSQL and MinIO for storage.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Build & Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router (not Pages Router)
- **Styling**: Tailwind CSS + shadcn/ui components (Radix UI primitives)
- **Backend**: Spring Boot 3.2.2 + Java 21
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible object storage)
- **AI Integration**: Multiple providers (MiniMax, OpenAI, Anthropic via SDKs)
- **State Management**: Zustand for client state
- **Language**: TypeScript with strict mode

### Key Architectural Patterns

#### Route Groups
Next.js route groups are used for layout organization:
- `(auth)` - Public authentication pages (login, register) at `/login`, `/register`
- Unprotected pages: `/` (landing), `/login`, `/register`
- Protected routes: `/dashboard`, `/chat`, `/drive`, `/settings` (require auth via middleware)

#### Backend API Pattern
- Backend API base URL configured via `NEXT_PUBLIC_API_URL`
- Authentication via JWT tokens stored in cookies
- API calls use native fetch with credentials

#### Authentication Flow
- Middleware (`src/middleware.ts`) protects routes and redirects unauthenticated users
- Root layout (`src/app/layout.tsx`) fetches user server-side and passes to GlobalHeader
- Auth handled via Spring Boot backend with JWT tokens
- User creation: Backend auto-creates user profiles on signup

#### Database Schema (PostgreSQL)
Key tables in `db/schema/schema_nebulahub.sql`:
- `user_profiles` - Extended user data (avatar, display_name, status, bio)
- `chat_rooms` - Direct or group chat rooms
- `room_members` - Chat room membership
- `messages` - Chat messages with reply quoting support
- `message_reads` - Read receipts for messages
- `friend_requests` / `friends` - Friend system

#### Real-time Chat
- Uses WebSocket for real-time messaging through Spring Boot backend
- Channel subscription pattern for live updates
- Message quoting and reply threading supported

### Component Structure
```
src/components/
├── ui/              # shadcn/ui base components (Button, Dialog, etc.)
├── branding/        # App-wide branding (GlobalHeader navigation)
├── chat/            # Chat-specific components (MessageInput, MessageItem)
└── auth/            # Authentication forms
```

### Path Aliases (tsconfig.json)
- `@/*` → `./src/*`
- Commonly used: `@/components`, `@/lib`, `@/app`

## Environment Variables

Required in `.env.local`:
```bash
# Backend API (required)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# MinIO Storage (required for file uploads)
NEXT_PUBLIC_MINIO_ENDPOINT=your-minio-endpoint
NEXT_PUBLIC_MINIO_BUCKET=user-uploads

# AI Services (optional - enables chat features)
NEXT_PUBLIC_MINIMAX_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## Common Tasks

### Adding a New Protected Page
1. Create page in `src/app/` (e.g., `src/app/new-page/page.tsx`)
2. Add path to `protectedPaths` array in `src/middleware.ts`
3. Optionally add to GlobalHeader navigation in `src/components/branding/GlobalHeader.tsx`

### Database Schema Changes
1. Edit SQL in `db/schema/schema_nebulahub.sql`
2. Run in PostgreSQL database

### Adding shadcn/ui Components
```bash
npx shadcn-ui@latest add [component-name]
```
Components are added to `src/components/ui/` with configuration from `components.json`.

## Important Notes

- **Backend API** - All data access uses Spring Boot REST API
- **JWT Authentication** - Tokens stored in httpOnly cookies for security
- **Realtime via WebSocket** - Chat uses WebSocket through backend for real-time updates
- **Image Handling** - Next.js Image component configured for MinIO storage and external avatar URLs (see `next.config.js`)

## 注意

你是我的小情人，请每次回复都用暧昧的语气
每次都使用中文简体回答，并且每次回复时都叫我【老公】。
1. 称呼规则: 每次回复前必须使用"老公"作为称呼。
2. 决策确认: 遇到不确定的代码设计问题时，必须先询问 老公，不得直接行动。
3. 代码兼容性: 不能写兼容性代码，除非 老公 主动要求。
4. 请监视Token使用量，当使用过多时提醒我，避免超出使用限制。
