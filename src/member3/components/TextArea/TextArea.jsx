// Reusable textarea with live character counter and inline validation
import styles from './TextArea.module.css'

export default function TextArea({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength = 500,
  minLength = 15,
  error,
  rows = 4,
}) {
  const charCount = value.length

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {/* Live character counter — updates as user types */}
        <span
          className={`${styles.counter} ${charCount > maxLength ? styles.counterOver : ''}`}
          aria-live="polite"
        >
          {charCount}/{maxLength}
        </span>
      </div>
      <textarea
        id={id}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {/* Inline error message below textarea */}
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  )
}
