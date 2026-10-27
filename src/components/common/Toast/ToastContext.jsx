import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import ToastContainer from './ToastContainer.jsx'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Dismiss a specific toast by id
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Clear all toasts
  const clear = useCallback(() => {
    setToasts([])
  }, [])

  // Core add toast function
  const addToast = useCallback((message, options = {}) => {
    const id = ++toastIdCounter
    const newToast = {
      id,
      message,
      title: options.title || null,
      type: options.type || 'info', // 'success', 'watchlist', 'watched', 'review', 'info', 'warning', 'error'
      duration: options.duration !== undefined ? options.duration : 3800,
      icon: options.icon || null,
      ...options,
    }

    // Limit maximum concurrent toasts to 5
    setToasts((prev) => [...prev.slice(-4), newToast])
    return id
  }, [])

  // Specialized toast helpers
  const toast = useMemo(() => {
    const fn = (message, options) => addToast(message, options)

    fn.success = (message, options = {}) =>
      addToast(message, { ...options, type: 'success' })

    fn.info = (message, options = {}) =>
      addToast(message, { ...options, type: 'info' })

    fn.warning = (message, options = {}) =>
      addToast(message, { ...options, type: 'warning' })

    fn.error = (message, options = {}) =>
      addToast(message, { ...options, type: 'error' })

    // Specific user requested shortcuts:
    // 1. "Added 'Interstellar' to your Watchlist"
    fn.addedToWatchlist = (title, options = {}) =>
      addToast(`Added '${title}' to your Watchlist`, {
        title: 'Watchlist Updated',
        ...options,
        type: 'watchlist',
      })

    // 2. "Marked 'Attack on Titan' as Watched"
    fn.markedAsWatched = (title, options = {}) =>
      addToast(`Marked '${title}' as Watched`, {
        title: 'Watch History Updated',
        ...options,
        type: 'watched',
      })

    // 3. "Review submitted successfully"
    fn.reviewSubmitted = (title = null, options = {}) =>
      addToast(title ? `Review for '${title}' submitted successfully` : 'Review submitted successfully', {
        title: 'Review Saved',
        ...options,
        type: 'review',
      })

    // General helpers
    fn.watchlist = fn.addedToWatchlist
    fn.watched = fn.markedAsWatched
    fn.review = fn.reviewSubmitted

    fn.dismiss = dismiss
    fn.clear = clear

    return fn
  }, [addToast, dismiss, clear])

  const contextValue = useMemo(
    () => ({
      toast,
      showToast: toast, // alias for convenience
      dismissToast: dismiss,
      clearToasts: clear,
    }),
    [toast, dismiss, clear]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// Hook to access toast system
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return context
}

export default ToastContext
