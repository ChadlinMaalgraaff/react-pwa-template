import { describe, it, expect } from 'vitest'
import { selectUser, selectIsAuthenticated, selectAuthError, selectIsAdmin } from '../auth.selectors'
import { selectPantryItemCount } from '../pantry.selectors'
import { RootState } from '@store/index'

const buildState = (overrides: Partial<RootState['auth']> = {}, pantryItemCount = 0): RootState =>
  ({
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      ...overrides,
    },
    pantry: { itemCount: pantryItemCount },
  } as RootState)

describe('auth selectors', () => {
  it('selects the user, auth status, and error', () => {
    const state = buildState({ isAuthenticated: true, error: 'oops' })
    expect(selectUser(state)).toBeNull()
    expect(selectIsAuthenticated(state)).toBe(true)
    expect(selectAuthError(state)).toBe('oops')
  })

  it('selectIsAdmin reflects the user role', () => {
    const adminState = buildState({
      user: {
        id: '1',
        email: 'a@b.com',
        name: 'Admin',
        role: 'admin',
        preferredArea: null,
        dietaryPreferences: [],
        createdAt: '',
        updatedAt: '',
      },
    })
    expect(selectIsAdmin(adminState)).toBe(true)
    expect(selectIsAdmin(buildState())).toBe(false)
  })
})

describe('pantry selectors', () => {
  it('selects the pantry item count', () => {
    expect(selectPantryItemCount(buildState({}, 5))).toBe(5)
  })
})
