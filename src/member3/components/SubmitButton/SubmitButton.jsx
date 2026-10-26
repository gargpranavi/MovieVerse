// Reusable submit button with optional loading/disabled state
import styles from './SubmitButton.module.css'

export default function SubmitButton({ children, disabled, type = 'submit' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${disabled ? styles.btnDisabled : ''}`}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
}
