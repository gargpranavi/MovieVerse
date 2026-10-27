/*
  FilterSortBar.jsx — Member 3
  Dropdown controls for sorting and genre filtering on the MoviesPage.
  Uses controlled dropdowns (useState) and immediately updates visible movies.
  Client-side only — filters/sorts the already-loaded movies array.
  Does NOT replace the infinite scroll; it operates on what is loaded.
*/
import styles from './FilterSortBar.module.css'

// Genre options for the filter dropdown (Anime uses 'Animation' genre in TMDB data)
export const GENRE_OPTIONS = [
  { value: 'all',       label: 'All Genres' },
  { value: 'Action',    label: 'Action' },
  { value: 'Science-Fiction', label: 'Sci-Fi' },
  { value: 'Drama',     label: 'Drama' },
  { value: 'Comedy',    label: 'Comedy' },
  { value: 'Animation', label: 'Anime / Animation' },
]

export const SORT_OPTIONS = [
  { value: 'default',      label: 'Popularity (Default)' },
  { value: 'rating',       label: 'Top Rated (TMDB)' },
  { value: 'release_date', label: 'Release Date (Newest First)' },
]

export default function FilterSortBar({ sortBy, genre, onSortChange, onGenreChange, onClear, filteredCount, totalCount, isFiltering }) {
  const hasFilters = sortBy !== 'default' || genre !== 'all'

  return (
    <div className={styles.bar}>
      {/* Left side: dropdowns */}
      <div className={styles.controls}>
        {/* Sort By dropdown */}
        <div className={styles.controlGroup}>
          <label htmlFor="movies-sort" className={styles.controlLabel}>Sort By</label>
          <select
            id="movies-sort"
            className={styles.select}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter By Genre dropdown */}
        <div className={styles.controlGroup}>
          <label htmlFor="movies-genre" className={styles.controlLabel}>Genre</label>
          <select
            id="movies-genre"
            className={styles.select}
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            {GENRE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters button — only visible when filters are active */}
        {hasFilters && (
          <button
            className={styles.clearBtn}
            onClick={onClear}
            type="button"
            aria-label="Clear all filters"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Right side: result count indicator */}
      {isFiltering && (
        <div className={styles.resultInfo}>
          <span>
            Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> loaded
          </span>
          <span className={styles.filterNote}>
            (filters apply to loaded movies)
          </span>
        </div>
      )}
    </div>
  )
}
