import TopNavbar from './TopNavbar.jsx'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.root}>
      <TopNavbar />
      <main className={styles.main}>{children}</main>
      <footer className={styles.tmdbAttribution}>
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.tmdbLink}
        >
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="The Movie Database (TMDB)"
            className={styles.tmdbLogo}
          />
        </a>
        <span className={styles.tmdbText}>
          Movie and TV data provided by{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.tmdbLink}
          >
            The Movie Database (TMDB)
          </a>
          . MovieVerse is not endorsed or certified by TMDB.
        </span>
      </footer>
    </div>
  )
}
