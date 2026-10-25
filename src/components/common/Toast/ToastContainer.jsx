import { useToast, TOAST_TYPES } from './ToastContext.jsx'
import styles from './ToastContainer.module.css'

/* ─── Icons ─── */
function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const ICON_MAP = {
  [TOAST_TYPES.SUCCESS]: <SuccessIcon />,
  [TOAST_TYPES.ERROR]:   <ErrorIcon />,
  [TOAST_TYPES.INFO]:    <InfoIcon />,
  [TOAST_TYPES.WARNING]: <WarningIcon />,
}

/* ─── Single Toast Item ─── */
function ToastItem({ toast, onDismiss }) {
  const icon = toast.icon || ICON_MAP[toast.type] || <InfoIcon />

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]}`}
      role="alert"
      aria-live="assertive"
      id={`toast-${toast.id}`}
      style={{ '--toast-duration': `${toast.duration}ms` }}
    >
      {/* Progress bar */}
      <div
        className={`${styles.progressBar} ${toast.paused ? styles.paused : ''}`}
        aria-hidden="true"
      />

      {/* Icon */}
      <span className={styles.icon}>{icon}</span>

      {/* Message */}
      <span className={styles.message}>{toast.message}</span>

      {/* Dismiss button */}
      <button
        className={styles.closeBtn}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

/* ─── Toast Container ─── */
export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className={styles.container} aria-label="Notifications" role="region">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
