# Testing Patterns

**Analysis Date:** 2026-04-20

## Test Framework

**Status:** Not currently configured

The project does not have a test framework installed. The `package.json` devDependencies show:
- No Jest
- No Vitest
- No React Testing Library
- No Cypress or Playwright for E2E

To add testing, the following would be recommended:
```bash
# Recommended setup for this project
npm install -D vitest @testing-library/react @testing-library/dom jsdom
# or
npm install -D jest @testing-library/react @testing-library/dom ts-jest
```

## Test File Organization

**Current State:** No test files exist in the codebase

Test files would follow these conventions if added:

### Recommended Locations
- Unit tests: Co-located with source files
- Page tests: `src/app/{route}/__tests__/` or `*.test.tsx`
- Component tests: Next to component `Button.test.tsx`
- Utility tests: `src/lib/__tests__/utils.test.ts`

### Recommended Naming
- `*.test.ts` or `*.test.tsx` for test files
- `*.spec.ts` or `*.spec.tsx` as alternative

## Testing Patterns to Implement

### Component Testing
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Page Testing
```typescript
// src/app/admin/users/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import UserManagementPage from './page';
import {vi} from 'vitest';

// Mock API
vi.mock('@/lib/api/modules/admin', () => ({
  getUserList: vi.fn().mockResolvedValue({
    code: 200,
    data: { records: [], total: 0, pages: 0 }
  })
}));

describe('UserManagementPage', () => {
  it('renders user list', async () => {
    render(<UserManagementPage />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// src/hooks/__tests__/usePermission.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePermission } from '../usePermission';
import { useAdminStore } from '../useAdminStore';

vi.mock('../useAdminStore');

describe('usePermission', () => {
  it('checks permissions correctly', () => {
    vi.mocked(useAdminStore).mockReturnValue({
      permissions: [{ code: 'user:read' }],
      roles: [],
      hasAdminAccess: true,
    });

    const { result } = renderHook(() => usePermission());
    expect(result.current.hasPermission('user:read')).toBe(true);
  });
});
```

### Utility Function Testing
```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatRelativeTime, debounce, throttle } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
});

describe('formatDate', () => {
  it('formats date in Chinese locale', () => {
    expect(formatDate('2024-01-15')).toContain('2024');
  });
});
```

## Mocking Patterns

### Mocking API Modules
```typescript
vi.mock('@/lib/api/modules/admin', () => ({
  getUserList: vi.fn(),
  updateUserStatus: vi.fn(),
  deleteUser: vi.fn(),
}));
```

### Mocking Zustand Store
```typescript
const mockStore = {
  data: [],
  setData: vi.fn(),
};

vi.mock('@/lib/store', () => ({
  useStore: () => mockStore,
}));
```

### Mocking Next.js Components
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/admin/users',
}));
```

### Mocking Third-Party Libraries
```typescript
vi.mock('lucide-react', () => ({
  Plus: () => <span>Plus</span>,
  Search: () => <span>Search</span>,
}));
```

## Test Configuration

### Vitest Config (Recommended)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Jest Config (Alternative)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
```

## Coverage

**Current Status:** None configured

To add coverage reporting:
```bash
# Vitest
vitest run --coverage

# Jest
jest --coverage
```

Recommended coverage targets:
- Utilities: 80%+
- Custom hooks: 80%+
- Complex components: 70%+
- Pages: 60%+

## E2E Testing

**Current Status:** Not configured

Recommended approach for this Next.js project:

### Playwright (Recommended)
```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/users.spec.ts
import { test, expect } from '@playwright/test';

test('user management page loads', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page.getByText('用户管理')).toBeVisible();
});
```

### Configuration
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

## What Should Be Tested

### High Priority
- Utility functions in `src/lib/utils.ts`
- Custom hooks (`src/hooks/`)
- API modules (`src/lib/api/modules/`)
- Error handling utilities

### Medium Priority
- UI components with complex interactions
- Admin pages with CRUD operations
- Authentication flows

### Low Priority
- Simple presentational components
- Static pages

## Running Tests

```bash
# When configured with Vitest
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# When configured with Jest
npm run test
npm run test:watch
npm run test:coverage
```

---

*Testing analysis: 2026-04-20*