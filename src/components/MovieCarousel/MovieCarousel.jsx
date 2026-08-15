import { useRef, useState } from 'react'
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
  const rowRef = useRef(null)
  const [isMoved, setIsMoved] = useState(false)

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
        
        <div className={styles.row} ref={rowRef}>
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
