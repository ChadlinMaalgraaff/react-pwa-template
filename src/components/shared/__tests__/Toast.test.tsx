import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer, { setNotification } from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import Toast from '@components/shared/Toast/Toast'

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when there is no notification', () => {
    const store = buildStore()
    render(
      <Provider store={store}>
        <Toast />
      </Provider>
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders the notification message and type', () => {
    const store = buildStore()
    store.dispatch(setNotification({ message: 'Recipe saved.', type: 'success' }))

    render(
      <Provider store={store}>
        <Toast />
      </Provider>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Recipe saved.')
    expect(screen.getByRole('alert')).toHaveClass('bg-primary')
  })

  it('dismisses the notification when the close button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    const store = buildStore()
    store.dispatch(setNotification({ message: 'Something went wrong', type: 'error' }))

    render(
      <Provider store={store}>
        <Toast />
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(store.getState().ui.notification).toBeNull()
  })

  it('auto-dismisses after a timeout', () => {
    const store = buildStore()
    store.dispatch(setNotification({ message: 'Heads up', type: 'warning' }))

    render(
      <Provider store={store}>
        <Toast />
      </Provider>
    )

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(store.getState().ui.notification).toBeNull()
  })
})
