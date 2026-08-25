/*
MovieVerse – ReviewCard.jsx
Member 2 | Day 4 — Review System

localStorage key: "movieverse_reviews"
Entry shape: { movieId, rating, review, date, id }

Props:
  movieId   — string/number show ID
  movieTitle — string, used in placeholder text
*/

import { useState, useEffect, useRef } from 'react'
import Rating, { getMovieRating } from './Rating.jsx'
import styles from './ReviewCard.module.css'

/*localStorage helpers*/
const LS_KEY = 'movieverse_reviews'

function loadAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAllReviews(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('reviewsUpdated'))
  } catch { /* ignore */ }
}

/** Get reviews for a specific movie */
export function getMovieReviews(movieId) {
  return loadAllReviews().filter(r => r.movieId === String(movieId))
}

/** Add a new review */
export function addReview(movieId, review, rating) {
  const all = loadAllReviews()
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    movieId: String(movieId),
    review: review.trim(),
    rating: rating ?? null,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
  all.push(entry)
  saveAllReviews(all)
  return entry
}

/** Delete a review by id */
export function deleteReview(id) {
  const all = loadAllReviews().filter(r => r.id !== id)
  saveAllReviews(all)
}

/** Edit a review */
export function editReview(id, newText, newRating) {
  const all = loadAllReviews()
  const idx = all.findIndex(r => r.id === id)
  if (idx > -1) {
    all[idx].review = newText.trim()
    if (newRating !== undefined) all[idx].rating = newRating
  }
  saveAllReviews(all)
}

/*Icons*/
function PenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function StarFilledIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="0.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/*ReviewCard Component*/
export default function ReviewCard({ movieId, movieTitle }) {
  const [reviews,      setReviews]      = useState([])
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [inputText,    setInputText]    = useState('')
  const [editingId,    setEditingId]    = useState(null)
  const [editText,     setEditText]     = useState('')
  const [currentRating, setCurrentRating] = useState(null)
  const textareaRef = useRef(null)

  /* Load reviews */
  useEffect(() => {
    setReviews(getMovieReviews(movieId))
    setCurrentRating(getMovieRating(movieId))

    const handleUpdate = () => {
      setReviews(getMovieReviews(movieId))
      setCurrentRating(getMovieRating(movieId))
    }
    window.addEventListener('reviewsUpdated', handleUpdate)
    window.addEventListener('ratingsUpdated', handleUpdate)
    return () => {
      window.removeEventListener('reviewsUpdated', handleUpdate)
      window.removeEventListener('ratingsUpdated', handleUpdate)
    }
  }, [movieId])

  /* Focus textarea when panel opens */
  useEffect(() => {
    if (panelOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [panelOpen])

  function handleSubmit(e) {
    e.stopPropagation()
    if (!inputText.trim()) return
    const freshRating = getMovieRating(movieId)
    addReview(movieId, inputText, freshRating)
    setInputText('')
    setReviews(getMovieReviews(movieId))
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    deleteReview(id)
    setReviews(getMovieReviews(movieId))
  }

  function handleEditSave(e, id) {
    e.stopPropagation()
    if (!editText.trim()) return
    editReview(id, editText)
    setEditingId(null)
    setEditText('')
    setReviews(getMovieReviews(movieId))
  }

  function startEdit(e, rev) {
    e.stopPropagation()
    setEditingId(rev.id)
    setEditText(rev.review)
  }

  function cancelEdit(e) {
    e.stopPropagation()
    setEditingId(null)
    setEditText('')
  }

  const togglePanel = (e) => {
    e.stopPropagation()
    setPanelOpen(v => !v)
  }

  return (
    <div className={styles.wrapper} onClick={e => e.stopPropagation()}>

      {/*Trigger button*/}
      <button
        className={`${styles.triggerBtn} ${panelOpen ? styles.triggerActive : ''}`}
        onClick={togglePanel}
        title={panelOpen ? 'Close reviews' : 'Add / View Reviews'}
        id={`review-btn-${movieId}`}
        type="button"
      >
        <PenIcon />
        <span>Review</span>
        {reviews.length > 0 && (
          <span className={styles.badge}>{reviews.length}</span>
        )}
      </button>

      {/*Review Panel (slide down)*/}
      {panelOpen && (
        <div className={styles.panel}>

          {/* Panel header */}
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              Your Reviews
              {reviews.length > 0 && <span className={styles.panelCount}> · {reviews.length}</span>}
            </span>
            <button className={styles.closeBtn} onClick={togglePanel} title="Close" type="button">
              <CloseIcon />
            </button>
          </div>

          {/* Existing reviews */}
          {reviews.length > 0 && (
            <div className={styles.reviewList}>
              {reviews.map(rev => (
                <div key={rev.id} className={styles.reviewItem}>
                  {editingId === rev.id ? (
                    /* Edit mode */
                    <div className={styles.editRow}>
                      <textarea
                        className={styles.editArea}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={2}
                        maxLength={300}
                        onClick={e => e.stopPropagation()}
                      />
                      <div className={styles.editActions}>
                        <button className={styles.saveBtnSmall} onClick={(e) => handleEditSave(e, rev.id)} type="button">Save</button>
                        <button className={styles.cancelBtnSmall} onClick={cancelEdit} type="button">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className={styles.reviewMeta}>
                        {rev.rating && (
                          <span className={styles.reviewRating}>
                            <StarFilledIcon /> {rev.rating}/5
                          </span>
                        )}
                        <span className={styles.reviewDate}>{rev.date}</span>
                        <div className={styles.reviewActions}>
                          <button
                            className={styles.iconActionBtn}
                            onClick={(e) => startEdit(e, rev)}
                            title="Edit review"
                            type="button"
                          >
                            <PenIcon />
                          </button>
                          <button
                            className={`${styles.iconActionBtn} ${styles.deleteBtn}`}
                            onClick={(e) => handleDelete(e, rev.id)}
                            title="Delete review"
                            type="button"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <p className={styles.reviewText}>{rev.review}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Write new review */}
          <div className={styles.writeSection}>
            <div className={styles.ratingRow}>
              <span className={styles.ratingPrompt}>Your rating:</span>
              <Rating movieId={movieId} size="sm" />
            </div>
            <div className={styles.inputRow}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder={`What did you think of "${movieTitle}"?`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                rows={2}
                maxLength={300}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
                }}
              />
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                title="Submit review (Ctrl+Enter)"
                type="button"
                id={`submit-review-${movieId}`}
              >
                <SendIcon />
              </button>
            </div>
            <span className={styles.hint}>Ctrl+Enter to submit · {300 - inputText.length} chars left</span>
          </div>

        </div>
      )}
    </div>
  )
}
