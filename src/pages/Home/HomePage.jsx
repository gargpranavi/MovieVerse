import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import MovieInfoModal from '../../components/MovieInfoModal/MovieInfoModal.jsx'
import styles from './HomePage.module.css'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  )
}

function formatRuntime(mins) {
  if (!mins) return '2h 10m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function HomePage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.tvmaze.com/shows')
      .then(res => res.json())
      .then(data => {
        const mappedData = data.slice(0, 50).map(show => ({
          id: show.id.toString(),
          title: show.name,
          year: show.premiered ? show.premiered.substring(0, 4) : '2023',
          duration: formatRuntime(show.runtime || show.averageRuntime),
          ageRating: 'U/A 16+', // TVMaze doesn't consistently provide this in standard format
          genres: show.genres.length > 0 ? show.genres : ['Drama'],
          description: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'A great story.',
          image: show.image ? show.image.original : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
          rating: show.rating?.average || 8.0,
        }));
        setShows(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || shows.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>
          <h2>Loading MovieVerse...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const featured = shows[0];
  const trending = shows.slice(1, 10);
  const topRated = shows.slice(10, 20).sort((a, b) => b.rating - a.rating);
  const actionMovies = shows.slice(20, 30);
  const sciFi = shows.slice(30, 40);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent}>
            <div className={styles.netflixLogoWrap}>
              <span className={styles.nSeries}>M</span> 
              <span className={styles.seriesText}>M O V I E V E R S E   O R I G I N A L</span>
            </div>
            
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            
            <div className={styles.heroMeta}>
              <span>Series</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span> &bull; 
              <span>{featured.duration}</span> &bull; 
              <span className={styles.ageBadge}>{featured.ageRating}</span>
            </div>
            <p className={styles.heroDesc}>
              {featured.description}
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
                <PlayIcon />
                <span className={styles.btnText}>Play</span>
              </button>
              <button type="button" className={styles.btnMoreInfo} onClick={() => setIsInfoOpen(true)}>
                <InfoIcon />
                <span className={styles.btnText}>More Info</span>
              </button>
            </div>
          </div>
          
          <div className={styles.heroBottomRight}>
            <button className={styles.btnVolume} aria-label="Toggle Volume">
              <VolumeIcon />
            </button>
            <div className={styles.languageBadge}>
              U/A 16+
            </div>
          </div>
        </section>

        <div className={styles.content}>
          <MovieCarousel title="Trending Now" movies={trending} />
          <MovieCarousel title="Top 10 Today" movies={topRated} />
          <MovieCarousel title="Binge-Worthy Series" movies={actionMovies} />
          <MovieCarousel title="Sci-Fi & Fantasy" movies={sciFi} />
        </div>
      </div>

      <VideoPlayerModal 
        isOpen={isPlayerOpen} 
        onClose={() => setIsPlayerOpen(false)} 
        movieTitle={featured.title} 
      />

      <MovieInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        movie={featured}
        onPlay={() => setIsPlayerOpen(true)}
      />
    </DashboardLayout>
  )
}

