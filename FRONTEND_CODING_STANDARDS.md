# Frontend Coding Standards

This document outlines the coding standards, best practices, and conventions for the FTD Frontend application.

## Table of Contents

1. [TypeScript](#typescript)
2. [React Components](#react-components)
3. [State Management (Redux)](#state-management-redux)
4. [File Organization](#file-organization)
5. [Naming Conventions](#naming-conventions)
6. [Testing](#testing)
7. [Performance](#performance)
8. [Accessibility](#accessibility)
9. [Code Quality](#code-quality)

## TypeScript

### Strict Mode

Always use TypeScript strict mode. Avoid `any` types.

```typescript
// ❌ Avoid
const handleData = (data: any) => {
  return data.value
}

// ✅ Good
interface DataProps {
  value: string
}

const handleData = (data: DataProps): string => {
  return data.value
}
```

### Type Definitions

Define types for components, services, and utilities:

```typescript
// ✅ Good - Clear type definitions
interface UserProfile {
  id: string
  email: string
  name: string
  roles: string[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
```

### Avoid Type Assertions

Use type inference where possible:

```typescript
// ❌ Avoid
const value = someValue as string

// ✅ Good - Type inference
const value: string = someValue
```

## React Components

### Functional Components

Use functional components with hooks. Class components should be avoided.

```typescript
// ✅ Good
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="card">
      <h3>{user.name}</h3>
    </div>
  )
}
```

### Component Structure

Follow consistent component structure:

```typescript
import React from 'react'
import { useAppDispatch } from '@hooks/redux.hooks'

interface ComponentProps {
  title: string
  onClose?: () => void
}

/**
 * Brief component description
 * Additional details about functionality
 */
const MyComponent: React.FC<ComponentProps> = ({ title, onClose }) => {
  // Hooks first
  const dispatch = useAppDispatch()
  const [state, setState] = React.useState('')

  // Event handlers
  const handleClick = () => {
    // Implementation
  }

  // JSX return
  return (
    <div>
      <h2>{title}</h2>
    </div>
  )
}

export default MyComponent
```

### Props

Always define component props with TypeScript interfaces:

```typescript
// ✅ Good
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  // Implementation
}
```

### Memoization

Use `React.memo` for expensive components:

```typescript
// ✅ Good for expensive components
const UserListItem = React.memo(({ user }: UserListItemProps) => {
  return <div>{user.name}</div>
})

// ✅ Use useCallback for stable function references
const handleClick = React.useCallback(() => {
  dispatch(someAction())
}, [dispatch])
```

### Hooks

Follow hooks best practices:

```typescript
// ✅ Good - Custom hook for API calls
const useFetchUsers = () => {
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get('/users')
        setUsers(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { users, isLoading, error }
}
```

## State Management (Redux)

### Store Organization

Keep Redux slices focused and single-responsibility:

```typescript
// ✅ Good - Single concern
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})
```

### Using Redux in Components

Use typed Redux hooks:

```typescript
// ✅ Good - Typed hooks
import { useAppDispatch, useAppSelector } from '@hooks/redux.hooks'

function Component() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### Selectors

Create reusable selectors for complex state:

```typescript
// store/selectors/auth.selectors.ts
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthError = (state: RootState) => state.auth.error
```

## File Organization

### Directory Structure

```
src/
├── components/
│   ├── layout/          # Layout components
│   ├── pages/           # Page/route components
│   ├── shared/          # Reusable components
│   │   └── __tests__/   # Component tests
│   └── index.ts         # Component exports
├── hooks/               # Custom hooks
├── services/            # API services
├── store/
│   ├── slices/          # Redux slices
│   ├── selectors/       # Redux selectors
│   └── index.ts         # Store configuration
├── types/               # Type definitions
├── utils/               # Utility functions
├── styles/              # Global styles
├── tests/
│   ├── setup.ts         # Test setup
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
└── main.tsx             # Entry point
```

### Component Files

One component per file:

```
components/shared/
├── Button.tsx           # Component
├── Button.stories.tsx   # Storybook stories
└── __tests__/
    └── Button.test.tsx  # Tests
```

## Naming Conventions

### Files

- Components: PascalCase (e.g., `UserCard.tsx`)
- Services: kebab-case with suffix (e.g., `auth-service.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useFetchUsers.ts`)
- Slices: kebab-case with `.slice` suffix (e.g., `auth.slice.ts`)
- Types: PascalCase with `Props` suffix for component props (e.g., `ButtonProps`)

### Variables and Functions

```typescript
// ✅ Good naming conventions
const userName = 'John'                    // Variables: camelCase
const isActive = true                      // Boolean: is/has prefix
const handleClick = () => {}               // Handlers: handle prefix
const fetchUsers = async () => {}          // Async: fetch/load prefix
const MAX_RETRIES = 3                      // Constants: UPPER_SNAKE_CASE

// Redux
const setUser = (payload) => {}            // Redux actions: set prefix
const selectUser = (state) => {}           // Selectors: select prefix
```

### Component Naming

```typescript
// ✅ Good
const UserProfileCard: React.FC<UserProfileCardProps> = () => {}
export default UserProfileCard

// Avoid generic names
// ❌ Avoid
const Card: React.FC = () => {}
```

## Testing

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Component from './Component'

describe('Component', () => {
  beforeEach(() => {
    // Setup
  })

  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    render(<Component />)
    await user.click(screen.getByRole('button'))
    // Assert
  })
})
```

### Testing Best Practices

- Test user behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility
- Keep tests simple and focused

```typescript
// ✅ Good
it('should display error message when validation fails', () => {
  render(<Form />)
  const input = screen.getByLabelText('Email')
  userEvent.type(input, 'invalid')
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})

// ❌ Avoid - Testing implementation
it('should set state', () => {
  const wrapper = render(<Component />)
  expect(wrapper.find('.input').prop('value')).toBe('')
})
```

### Coverage Goals

- Aim for 80%+ code coverage
- 100% coverage for critical paths (auth, payments)
- Focus on meaningful tests, not just coverage

### Tests Are Required

Every new component, hook, util, or bug fix must ship with tests covering it.
A pull request that adds behavior without a corresponding test (or a fix
without a regression test) should not be merged.

## Performance

### Code Splitting

Lazy load route components:

```typescript
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('@components/pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}
```

### Memoization

Use memoization judiciously:

```typescript
// ✅ Good - Prevent unnecessary renders
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>
}, (prev, next) => {
  return prev.data === next.data
})

// Stable function references with useCallback
const handleChange = React.useCallback((value: string) => {
  dispatch(setValue(value))
}, [dispatch])
```

### Image Optimization

```typescript
// ✅ Good - Use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

## Accessibility

### ARIA Labels

Always include proper labels and ARIA attributes:

```typescript
// ✅ Good
<button aria-label="Close modal">
  <svg aria-hidden="true">×</svg>
</button>

<input
  type="email"
  aria-label="Email address"
  aria-required="true"
/>

// Semantic HTML
<button>Submit</button>         // Not <div onClick>
<a href="/page">Link</a>        // Not <span onClick>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```typescript
// ✅ Good - Button is keyboard accessible
<button onClick={handleClick}>Click me</button>

// ❌ Avoid - Not keyboard accessible
<div onClick={handleClick} role="button">Click me</div>
```

### Color Contrast

Ensure text meets WCAG AA standards (4.5:1 ratio):

```css
/* ✅ Good contrast */
.text-primary {
  color: #1F2937;        /* Dark text */
  background-color: #FFFFFF;
  /* Ratio: 18.5:1 */
}

/* ❌ Poor contrast */
.text-light {
  color: #F3F4F6;        /* Light text */
  background-color: #FFFFFF;
  /* Ratio: 1.07:1 */
}
```

## Code Quality

### Comments

Use JSDoc for public APIs:

```typescript
/**
 * Formats a date string to locale-specific format
 * @param date - The date to format
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'en-US') // "1/15/2024"
 */
export const formatDate = (date: Date, locale = 'en-US'): string => {
  return date.toLocaleDateString(locale)
}
```

### Avoid Deep Nesting

Keep functions and components flat:

```typescript
// ❌ Avoid - Too deep
const handleSubmit = () => {
  if (isValid) {
    if (user) {
      if (permissions) {
        submitForm()
      }
    }
  }
}

// ✅ Good - Early returns
const handleSubmit = () => {
  if (!isValid) return
  if (!user) return
  if (!permissions) return
  submitForm()
}
```

### DRY Principle

Extract reusable logic into custom hooks:

```typescript
// ✅ Good - Reusable hook
const useFetchData = (url: string) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    apiClient.get(url).then(setData).finally(() => setLoading(false))
  }, [url])

  return { data, loading }
}

// Use in multiple components
function Component1() {
  const { data } = useFetchData('/users')
}

function Component2() {
  const { data } = useFetchData('/products')
}
```

### Error Handling

Always handle errors gracefully:

```typescript
// ✅ Good error handling
const handleFetch = async () => {
  try {
    const data = await apiClient.get('/data')
    setData(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    dispatch(setNotification({
      message,
      type: 'error'
    }))
    console.error('Fetch failed:', error)
  } finally {
    setIsLoading(false)
  }
}
```

## Git Commits

Follow conventional commit messages:

```
feat: Add user profile page
fix: Correct navigation bug in sidebar
docs: Update coding standards
style: Format files with Prettier
refactor: Extract API client logic
test: Add tests for Button component
chore: Update dependencies
```

## Linting and Formatting

ESLint must pass with zero errors and zero warnings (`--max-warnings 0`)
before code is committed or merged. Do not disable rules or widen
`ignorePatterns` to silence failures — fix the underlying issue.

Run these commands before committing:

```bash
npm run lint -- --fix        # Fix ESLint issues
npm run type-check           # Check TypeScript
npm run test                 # Run tests
npm run build                # Build for production
```

A pre-commit hook (Husky + lint-staged, see `.husky/pre-commit`) runs ESLint
on staged `.ts`/`.tsx` files and the full test suite automatically. Commits
that fail lint or tests are blocked.

## Summary

- ✅ Use TypeScript strictly
- ✅ Write functional components with hooks
- ✅ Keep Redux slices focused
- ✅ Write tests for all new code and bug fixes
- ✅ Pass ESLint with zero errors/warnings
- ✅ Optimize performance
- ✅ Ensure accessibility
- ✅ Follow naming conventions
- ✅ Write clear, maintainable code

For questions, refer to the React, TypeScript, or Redux documentation, or discuss with the team.
