import { useState, useEffect, useRef } from 'react'
import styles from './Toast.module.css'

/* ── Inline SVG Icons ───────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ── Toast Item Component ───────────────────────────────────────────────────── */
export default function ToastItem({ toast, onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const remainingTimeRef = useRef(toast.duration || 3800)

  // Type styling class
  const typeClass = (() => {
    switch (toast.type) {
      case 'watchlist': return styles.typeWatchlist
      case 'watched':   return styles.typeWatched
      case 'warning':   return styles.typeWarning
      case 'error':     return styles.typeError
      case 'info':      return styles.typeInfo
      case 'review':
      case 'success':
      default:          return styles.typeSuccess
    }
  })()

  // Default icon based on type
  const renderIcon = () => {
    if (toast.icon) return toast.icon
    switch (toast.type) {
      case 'watchlist': return <BookmarkIcon />
      case 'watched':   return <EyeIcon />
      case 'review':    return <StarIcon />
      case 'info':      return <InfoIcon />
      case 'warning':   return <WarningIcon />
      case 'error':     return <ErrorIcon />
      case 'success':
      default:          return <CheckIcon />
    }
  }

  const triggerDismiss = () => {
    if (isDismissing) return
    setIsDismissing(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  // Handle countdown with pause on hover
  useEffect(() => {
    if (toast.duration === Infinity) return

    const startTimer = () => {
      startTimeRef.current = Date.now()
      timerRef.current = setTimeout(() => {
        triggerDismiss()
      }, remainingTimeRef.current)
    }

    if (!isPaused && !isDismissing) {
      startTimer()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPaused, isDismissing])

  const handleMouseEnter = () => {
    if (toast.duration === Infinity || isDismissing) return
    clearTimeout(timerRef.current)
    const elapsed = Date.now() - startTimeRef.current
    remainingTimeRef.current = Math.max(200, remainingTimeRef.current - elapsed)
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    if (toast.duration === Infinity || isDismissing) return
    setIsPaused(false)
  }

  return (
    <div
      className={`${styles.toastItem} ${typeClass} ${isDismissing ? styles.toastDismissing : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={triggerDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        {renderIcon()}
      </div>

      <div className={styles.content}>
        {toast.title && <span className={styles.title}>{toast.title}</span>}
        <div className={styles.message}>{toast.message}</div>
      </div>

      <button
        type="button"
        className={styles.closeBtn}
        onClick={(e) => {
          e.stopPropagation()
          triggerDismiss()
        }}
        aria-label="Close notification"
      >
        <CloseIcon />
      </button>

      {toast.duration !== Infinity && (
        <div
          className={`${styles.progressBar} ${styles.progressBarActive} ${isPaused ? styles.progressBarPaused : ''}`}
          style={{ animationDuration: `${toast.duration || 3800}ms` }}
        />
      )}
    </div>
  )
}
