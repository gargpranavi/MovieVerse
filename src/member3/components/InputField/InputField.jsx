// Reusable controlled text input with label and inline validation error
import styles from './InputField.module.css'

export default function InputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  error,
  type = 'text',
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {/* Show inline validation error below input */}
      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
