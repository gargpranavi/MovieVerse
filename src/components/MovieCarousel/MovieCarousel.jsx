77777777777777777777777777777777777import { useRef, useState, useCallback, useEffect } from 'react'
import MovieCard from '../MovieCard/MovieCard.jsx'
import styles from './MovieCarousel.module.css'

function ChevronLeftIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}

export default function MovieCarousel({ title, movies, isNumbered }) {
  const rowRef    = useRef(null)
  const [isMoved, setIsMoved] = useState(false)

  // ── Mouse drag-to-scroll ─────────────────────────────────────────────────
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const startScroll = useRef(0)
  // Threshold in px — below this the click is treated as a normal click on the card
  const DRAG_THRESHOLD = 5
  const draggedPx   = useRef(0)

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return   // left-click only
    isDragging.current  = true
    startX.current      = e.pageX - rowRef.current.offsetLeft
    startScroll.current = rowRef.current.scrollLeft
    draggedPx.current   = 0
    rowRef.current.style.cursor = 'grabbing'
    rowRef.current.style.userSelect = 'none'
    // Suppress smooth scroll during drag
    rowRef.current.style.scrollBehavior = 'auto'
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    const x    = e.pageX - rowRef.current.offsetLeft
    const walk = x - startX.current
    draggedPx.current = Math.abs(walk)
    rowRef.current.scrollLeft = startScroll.current - walk
    if (draggedPx.current > 0) setIsMoved(true)
  }, [])

  const stopDrag = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    if (rowRef.current) {
      rowRef.current.style.cursor = 'grab'
      rowRef.current.style.removeProperty('user-select')
      rowRef.current.style.scrollBehavior = 'smooth'
    }
  }, [])

  // Prevent child card click if the user actually dragged
  const onClickCapture = useCallback((e) => {
    if (draggedPx.current > DRAG_THRESHOLD) {
      e.stopPropagation()
      e.preventDefault()
    }
  }, [])

  // Global mouseup / mouseleave so drag ends even if cursor leaves the row
  useEffect(() => {
    window.addEventListener('mouseup',    stopDrag)
    window.addEventListener('mouseleave', stopDrag)
    return () => {
      window.removeEventListener('mouseup',    stopDrag)
      window.removeEventListener('mouseleave', stopDrag)
    }
  }, [stopDrag])

  // ── Arrow button scroll ──────────────────────────────────────────────────
  const handleArrowClick = (direction) => {
    setIsMoved(true)
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselTitle}>{title}</h2>

      <div className={styles.wrapper}>
        {isMoved && (
          <button
            className={`${styles.sliderArrow} ${styles.leftArrow}`}
            onClick={() => handleArrowClick('left')}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon />
          </button>
        )}

        <div
          className={styles.row}
          ref={rowRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onClickCapture={onClickCapture}
          style={{ cursor: 'grab' }}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={isNumbered ? index + 1 : undefined}
            />
          ))}
        </div>

        <button
          className={`${styles.sliderArrow} ${styles.rightArrow}`}
          onClick={() => handleArrowClick('right')}
          aria-label="Scroll right"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}
