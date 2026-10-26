import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce any fast-changing value (such as search input).
 * Ensures zero input lag while typing, and prevents network flooding by delaying
 * execution until the user has stopped typing for the specified delay.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce duration in milliseconds (default: 300)
 * @returns {any} debouncedValue
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
