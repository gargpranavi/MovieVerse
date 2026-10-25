import { createContext, useContext, useReducer, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

/* ─── Types ─── */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR:   'error',
  INFO:    'info',
  WARNING: 'warning',
}

/* ─── Reducer ─── */
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      // Keep at most 5 toasts at a time
      return [...state.slice(-4), action.payload]

    case 'REMOVE_TOAST':
      return state.filter(t => t.id !== action.id)

    case 'PAUSE_TOAST':
      return state.map(t =>
        t.id === action.id ? { ...t, paused: true } : t
      )

    case 'RESUME_TOAST':
      return state.map(t =>
        t.id === action.id ? { ...t, paused: false } : t
      )

    default:
      return state
  }
}

/* ─── Provider ─── */
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, [])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {object} options
   * @param {'success'|'error'|'info'|'warning'} options.type
   * @param {number} options.duration - ms before auto-dismiss (default 3500)
   * @param {string} options.icon - optional emoji/string icon override
   */
  const toast = useCallback((message, options = {}) => {
    const {
      type     = TOAST_TYPES.SUCCESS,
      duration = 3500,
      icon     = null,
    } = options

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    dispatch({
      type:    'ADD_TOAST',
      payload: { id, message, type, duration, icon, paused: false },
    })

    // Schedule auto-dismiss
    timers.current[id] = setTimeout(() => dismiss(id), duration)

    return id
  }, [dismiss])

  // Convenience helpers
  const success = useCallback((msg, opts) => toast(msg, { ...opts, type: TOAST_TYPES.SUCCESS }), [toast])
  const error   = useCallback((msg, opts) => toast(msg, { ...opts, type: TOAST_TYPES.ERROR   }), [toast])
  const info    = useCallback((msg, opts) => toast(msg, { ...opts, type: TOAST_TYPES.INFO    }), [toast])
  const warning = useCallback((msg, opts) => toast(msg, { ...opts, type: TOAST_TYPES.WARNING }), [toast])

  const value = { toasts, toast, success, error, info, warning, dismiss }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

/* ─── Hook ─── */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
