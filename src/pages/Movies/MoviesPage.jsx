import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import { shows } from '../../data/index.js'
import styles from '../Home/HomePage.module.css'

// Movies page uses shows that have movie-like genres (Action, Crime, Thriller, Sci-Fi, etc.)
const movieGenres = ['Action', 'Crime', 'Thriller', 'Sci-Fi', 'Adventure', 'Horror', 'Mystery']
const movies = shows.filter(s => s.genres.some(g => movieGenres.includes(g)))

export default function MoviesPage() {
  const featured      = movies[0]
  const trendingMovies = movies.slice(1, 9)
  const actionMovies   = movies.filter(s => s.genres.includes('Action')).slice(0, 8)
  const thrillers      = movies.filter(s => s.genres.includes('Thriller')).slice(0, 8)

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero} style={{ height: '60vh', minHeight: '400px' }}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent} style={{ justifyContent: 'center' }}>
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            <div className={styles.heroMeta}>
              <span>Movie</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span>
            </div>
            <p className={styles.heroDesc} style={{ WebkitLineClamp: 2 }}>
              {featured.description}
            </p>
          </div>
        </section>

        <div className={styles.content} style={{ marginTop: '-100px' }}>
          <MovieCarousel title="Trending Movies"  movies={trendingMovies} />
          <MovieCarousel title="Action Packed"    movies={actionMovies}   />
          {thrillers.length > 0 && (
            <MovieCarousel title="Thrillers" movies={thrillers} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
