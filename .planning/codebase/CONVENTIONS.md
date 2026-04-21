# Coding Conventions

**Analysis Date:** 2026-04-20

## Naming Patterns

### Files
- React components: PascalCase (`Button.tsx`, `MessageItem.tsx`, `ResizableTable.tsx`)
- Utility files: camelCase (`utils.ts`, `error-handler.ts`)
- Type files: camelCase with `.types.ts` suffix or singular (`types.ts`, `admin/types.ts`)
- API modules: camelCase within `modules/` directory (`user.ts`, `auth.ts`)
- Hooks: camelCase with `use` prefix (`usePermission.ts`, `useTheme.ts`)
- Page routes: kebab-case or route-style (`admin/users/page.tsx`, `blog/[id]/page.tsx`)

### Functions
- React components: PascalCase (exported) or camelCase (internal)
- Custom hooks: camelCase with `use` prefix
- Utility functions: camelCase
- Event handlers: camelCase with `handle` prefix (`handleDelete`, `handleStatusToggle`)
- API functions: camelCase, verb-first (`getUserList`, `updateUserStatus`, `deleteUser`)

### Variables
- State variables: camelCase with descriptive names (`searchQuery`, `pagination`)
- Props: camelCase
- Constants: camelCase or SCREAMING_SNAKE_CASE for true constants
- TypeScript types: PascalCase

### Types
```typescript
// Use type or interface for objects
export type Message = {
  id: string;
  content: string;
  sender_name: string;
};

// Use interface for component props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

// Use VariantProps from class-variance-authority
export interface ButtonProps extends VariantProps<typeof buttonVariants> {}
```

## Code Style

### Formatting
- Tool: ESLint + TypeScript (via `eslint-config-next/core-web-vitals`)
- Configuration: `eslint.config.mjs` using flat config
- Tab style: 2 spaces (Next.js default)
- Semicolons: Required

### Linting
- ESLint with typescript-eslint integration
- Key rules enforced:
  - `no-console`: Warning in production (allows `warn`, `error`)
  - `@typescript-eslint/no-explicit-any`: Warning
  - `@typescript-eslint/no-unused-vars`: Error (allows `_` prefix for intentionally unused)
  - `@typescript-eslint/ban-types`: Error

### Import Organization
1. React and framework imports
2. Third-party libraries (Radix UI, Lucide, etc.)
3. Internal imports (`@/` path alias)
4. Type imports

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
```

### Path Aliases
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Use `@/` for all internal imports

## Component Structure Patterns

### Client vs Server Components
- Use `'use client'` directive for client-side interactivity
- Default to server components when possible

### UI Components (`src/components/ui/`)
Follow shadcn/ui pattern:
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("base classes", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### Page Components (`src/app/`)
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function PageName() {
  const [state, setState] = useState<Type>();
  const { toast } = useToast();

  // useCallback for async operations
  const fetchData = useCallback(async () => {
    // implementation
  }, [dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <div>...</div>;
}
```

## Error Handling

### Pattern: Error Handler Utility
Location: `src/lib/utils/error-handler.ts`

```typescript
// Get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '发生未知错误，请稍后重试';
}

// Handle auth expiration
export function handleAuthExpired(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
}

// Check error types
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}
export function isAuthError(error: unknown): boolean {
  return error instanceof Error && (error.message.includes('401') || ...);
}
```

### Pattern: Try-Catch with Toast
```typescript
try {
  const response = await apiCall();
  if (response.code === 200) {
    toast({ title: 'Success', description: 'Operation completed' });
  } else {
    toast({ title: 'Failed', description: response.message, variant: 'destructive' });
  }
} catch (error) {
  console.error('Failed to fetch:', error);
  toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
}
```

## Styling Approach

### Tailwind CSS
- Primary styling method
- CSS variables for theming (defined in `tailwind.config.ts`)
- Custom animations defined in config

### CSS Variables Pattern
```typescript
colors: {
  border: "hsl(var(--border))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
}
```

### Custom Animations
```typescript
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "fade-in": {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
},
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "fade-in": "fade-in 0.3s ease-out",
}
```

### Class Utility
Use `cn()` from `lib/utils.ts` for conditional classes:
```typescript
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}
```

### CVA (Class Variance Authority)
For component variants in UI components:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base classes", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

## TypeScript Usage

### Strict Mode
Enabled in `tsconfig.json`: `"strict": true`

### Common Patterns
```typescript
// Generic constraints
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;

// Optional props with defaults
const Button = ({ asChild = false, ...props }) => { ... };

// Forward ref pattern
const Component = React.forwardRef<HTMLButtonElement, Props>(({ }, ref) => { ... });
Component.displayName = "Component";

// React.FC vs direct function
// Use direct function for simpler components
export const MessageItem: React.FC<MessageItemProps> = ({ ... }) => { ... };
```

### API Response Types
```typescript
interface ApiResponse<T> {
  code: number;
  data?: T;
  message?: string;
}
```

## Logging Patterns

- Use `console.error` for API errors and unexpected failures
- Include context in error messages
- Avoid `console.log` in production code (warn-only via ESLint)

```typescript
console.error('[API Error]', errorMessage, error);
```

## Comments

- Chinese comments for business logic (project is Chinese-focused)
- English for technical patterns
- JSDoc for exported functions when helpful

---

*Convention analysis: 2026-04-20*