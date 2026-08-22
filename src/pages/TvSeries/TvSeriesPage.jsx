import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import { shows } from '../../data/index.js'
import styles from '../Home/HomePage.module.css'

// TV Series page: reverse list so it looks different from home
const tvShows = [...shows].reverse()

export default function TvSeriesPage() {
  const featured     = tvShows[0]
  const dramaSeries  = tvShows.slice(1, 11)
  const comedySeries = tvShows.filter(s => s.genres.includes('Comedy')).slice(0, 8)
  const crimeSeries  = tvShows.filter(s => s.genres.includes('Crime')).slice(0, 8)

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero} style={{ height: '70vh', minHeight: '500px' }}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent}>
            <div className={styles.netflixLogoWrap}>
              <span className={styles.nSeries}>S</span> 
              <span className={styles.seriesText}>S E R I E S</span>
            </div>
            
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            
            <div className={styles.heroMeta}>
              <span>Series</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span>
            </div>
            <p className={styles.heroDesc} style={{ WebkitLineClamp: 3 }}>
              {featured.description}
            </p>
          </div>
        </section>

        <div className={styles.content} style={{ marginTop: '-120px' }}>
          <MovieCarousel title="Critically Acclaimed Dramas" movies={dramaSeries}  />
          {comedySeries.length > 0 && (
            <MovieCarousel title="Binge-Worthy Comedies" movies={comedySeries} />
          )}
          {crimeSeries.length > 0 && (
            <MovieCarousel title="Crime & Mystery" movies={crimeSeries} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
