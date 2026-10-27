/*
  CommunityReviewForm.jsx — Member 3
  "Leave a Community Review" form with real-time validation.
  Uses reusable InputField, StarRatingPicker, TextArea, SubmitButton components.
  Validates on blur and on submit. Shows inline errors and a success message.
*/
import { useState } from 'react'
import InputField from '../InputField/InputField.jsx'
import StarRatingPicker from '../StarRatingPicker/StarRatingPicker.jsx'
import TextArea from '../TextArea/TextArea.jsx'
import SubmitButton from '../SubmitButton/SubmitButton.jsx'
import { addCommunityReview } from '../../utils/communityReviews.js'
import styles from './CommunityReviewForm.module.css'

// ── Validation rules ──────────────────────────────────────────────────────────
function validateName(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Name is required.'
  if (trimmed.length < 2) return 'Name must be at least 2 characters.'
  if (trimmed.length > 40) return 'Name cannot exceed 40 characters.'
  return ''
}

function validateRating(value) {
  if (!value || value === 0) return 'Please select a star rating.'
  return ''
}

function validateText(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Review text is required.'
  if (trimmed.length < 15) return 'Review must be at least 15 characters.'
  if (trimmed.length > 500) return 'Review cannot exceed 500 characters.'
  return ''
}

export default function CommunityReviewForm({ movieId, onReviewAdded }) {
  // Controlled form state
  const [name, setName]     = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText]     = useState('')

  // Track which fields have been "touched" (blurred at least once)
  const [touched, setTouched] = useState({ name: false, rating: false, text: false })

  // Success state
  const [submitted, setSubmitted] = useState(false)

  // Compute current errors (only shown after field is touched)
  const nameError   = touched.name   ? validateName(name)     : ''
  const ratingError = touched.rating ? validateRating(rating)  : ''
  const textError   = touched.text   ? validateText(text)      : ''

  // Mark field as touched when user leaves it
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Touch all fields to show all errors at once
    setTouched({ name: true, rating: true, text: true })

    // Validate everything before saving
    if (validateName(name) || validateRating(rating) || validateText(text)) return

    // Save to localStorage and notify parent to refresh list
    addCommunityReview(movieId, { name, rating, text })
    onReviewAdded && onReviewAdded()

    // Show success message, reset form
    setSubmitted(true)
    setName('')
    setRating(0)
    setText('')
    setTouched({ name: false, rating: false, text: false })

    // Hide success message after 4 seconds
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className={styles.formWrapper}>
      <h3 className={styles.formHeading}>✍️ Leave a Community Review</h3>

      {/* Success message shown after successful submission */}
      {submitted && (
        <div className={styles.successMsg} role="status" aria-live="polite">
          ✅ Your review has been published! Thank you.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Reviewer Name field */}
        <InputField
          id="reviewer-name"
          label="Your Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            // If field was already touched, re-validate in real-time
            if (touched.name) setTouched((prev) => ({ ...prev, name: true }))
          }}
          onBlur={() => handleBlur('name')}
          placeholder="e.g. Ravi Kumar"
          maxLength={40}
          error={nameError}
        />

        {/* Interactive star rating picker */}
        <StarRatingPicker
          rating={rating}
          onChange={(val) => {
            setRating(val)
            setTouched((prev) => ({ ...prev, rating: true }))
          }}
          onBlur={() => handleBlur('rating')}
          error={ratingError}
        />

        {/* Review text area with live counter */}
        <TextArea
          id="review-text"
          label="Your Review"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (touched.text) setTouched((prev) => ({ ...prev, text: true }))
          }}
          onBlur={() => handleBlur('text')}
          placeholder="Share your thoughts about this movie... (minimum 15 characters)"
          maxLength={500}
          minLength={15}
          error={textError}
        />

        {/* Submit button */}
        <div className={styles.actions}>
          <SubmitButton>Submit Review</SubmitButton>
        </div>
      </form>
    </div>
  )
}
